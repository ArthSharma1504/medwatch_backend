// controllers/peopleController.js
const db = require("../config/db");

// helper: promisified db.query
function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

const CONTACT_WINDOW_MINUTES = parseInt(process.env.CONTACT_WINDOW_MINUTES) || 60;

async function getDirectContactsForLogs(primaryRfid, primaryLogs, windowMinutes) {
  const contacts = new Set();

  for (const log of primaryLogs) {
    const { location, timestamp } = log;
    const rows = await queryAsync(
      `SELECT DISTINCT rfid FROM rfid_logs 
       WHERE location = ? AND rfid <> ? 
         AND timestamp BETWEEN DATE_SUB(?, INTERVAL ? MINUTE) AND DATE_ADD(?, INTERVAL ? MINUTE)`,
      [location, primaryRfid, timestamp, windowMinutes, timestamp]
    );

    rows.forEach(r => contacts.add(r.rfid));
  }

  return Array.from(contacts);
}

async function buildContactChain(primaryRfid, windowMinutes = CONTACT_WINDOW_MINUTES) {
  // 1) fetch recent logs for primary (limit to last N to keep queries bounded)
  const primaryLogs = await queryAsync(
    `SELECT location, timestamp FROM rfid_logs WHERE rfid = ? ORDER BY timestamp DESC LIMIT 200`,
    [primaryRfid]
  );

  // direct contacts (secondary)
  const secondary = await getDirectContactsForLogs(primaryRfid, primaryLogs, windowMinutes);

  // tertiary: contacts of each secondary, excluding primary and already-known secondary
  const tertiarySet = new Set();
  for (const sec of secondary) {
    // fetch logs of secondary (limit)
    const secLogs = await queryAsync(
      `SELECT location, timestamp FROM rfid_logs WHERE rfid = ? ORDER BY timestamp DESC LIMIT 200`,
      [sec]
    );

    const secContacts = await getDirectContactsForLogs(sec, secLogs, windowMinutes);
    secContacts.forEach(c => {
      if (c !== primaryRfid && !secondary.includes(c)) tertiarySet.add(c);
    });
  }
  const tertiary = Array.from(tertiarySet);

  // Build a simple graph JSON (nodes + edges) suitable for frontend graph libraries
  const nodes = [];
  const nodeSet = new Set();

  function addNode(rfid, label, priority) {
    if (!nodeSet.has(rfid)) {
      nodes.push({ id: rfid, label: label || rfid, priority }); // priority: primary/secondary/tertiary
      nodeSet.add(rfid);
    }
  }

  // add nodes
  addNode(primaryRfid, primaryRfid, "primary");
  secondary.forEach(r => addNode(r, r, "secondary"));
  tertiary.forEach(r => addNode(r, r, "tertiary"));

  // edges
  const edges = [];
  secondary.forEach(s => edges.push({ from: primaryRfid, to: s }));
  // connect secondary -> tertiary (if a tertiary is connected to a secondary, we will create edges)
  for (const sec of secondary) {
    // find contacts of sec which are tertiary (recompute or query)
    // For performance we will check membership in tertiary array
    const secLogs = await queryAsync(
      `SELECT location, timestamp FROM rfid_logs WHERE rfid = ? ORDER BY timestamp DESC LIMIT 200`,
      [sec]
    );
    const secContacts = await getDirectContactsForLogs(sec, secLogs, windowMinutes);
    secContacts.forEach(c => {
      if (tertiary.includes(c)) {
        edges.push({ from: sec, to: c });
      }
    });
  }

  return { nodes, edges, meta: { primary: primaryRfid, secondaryCount: secondary.length, tertiaryCount: tertiary.length } };
}

exports.getContactChain = async (req, res) => {
  try {
    const primaryRfid = req.params.rfid;
    const windowMinutes = req.query.window ? parseInt(req.query.window) : CONTACT_WINDOW_MINUTES;

    if (!primaryRfid) return res.status(400).json({ message: "rfid required" });

    const chain = await buildContactChain(primaryRfid, windowMinutes);
    res.json(chain);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// flag a person (suspected/positive). If positive -> generate alerts and return computed chain
exports.flagPerson = async (req, res) => {
  try {
    const { rfid, status } = req.body;
    if (!rfid || !status) return res.status(400).json({ message: "rfid and status required" });

    // update people table
    await queryAsync(`UPDATE people SET disease_status = ? WHERE rfid = ?`, [status, rfid]);

    // create an alert for the primary person
    await queryAsync(`INSERT INTO alerts (rfid, message) VALUES (?, ?)`, [rfid, `Person flagged as ${status}`]);

    // if positive, compute chain and create alerts for secondary/tertiary
    if (status === "positive") {
      const chain = await buildContactChain(rfid);

      // ingest nodes and determine priority by 'priority' field in node
      if (chain && Array.isArray(chain.nodes)) {
        for (const node of chain.nodes) {
          if (node.id === rfid) continue;
          const priority = node.priority || "secondary";
          const message = `AUTOMATED ALERT: ${priority.toUpperCase()} contact with ${rfid}`;
          await queryAsync(`INSERT INTO alerts (rfid, message) VALUES (?, ?)`, [node.id, message]);
        }
      }

      return res.json({ message: "Flagged as positive, alerts generated", chain });
    }

    res.json({ message: `Flagged as ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
