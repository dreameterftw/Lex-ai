// test-complete.js (delete after testing)
import { db } from "./src/config/firebase.js";
import { createNewSession }
  from "./src/services/sessionService.js";
import { analyzeSituation }
  from "./src/services/situationService.js";
import { identifyRights }
  from "./src/services/rightsService.js";
import { calculateDeadlines }
  from "./src/services/deadlineService.js";
import { generateSignalLetter }
  from "./src/services/signalService.js";
import { sendCounselMessage }
  from "./src/services/counselService.js";
import { generateCourtPrep }
  from "./src/services/courtPrepService.js";
import { runHealthCheck }
  from "./src/services/healthCheckService.js";
import { recordOutcome }
  from "./src/services/outcomeService.js";
import { getUserAlerts }
  from "./src/services/alertsService.js";
import { getCategories }
  from "./src/services/libraryService.js";
import { getTimeline }
  from "./src/services/timelineService.js";

const USER_ID = "test-complete-user";
let SESSION_ID;

console.log("Running complete backend test...\n");

// 1 — Session
const session = await createNewSession(USER_ID, "California");
SESSION_ID = session.sessionId;
console.log("✓ 1. Session created");

// 2 — Situation
await analyzeSituation(
  SESSION_ID, USER_ID,
  "My landlord hasn't fixed heating for 3 weeks and is threatening eviction after I complained",
  "California"
);
console.log("✓ 2. Situation analyzed");

// 3 — Rights
await identifyRights(SESSION_ID, USER_ID);
console.log("✓ 3. Rights identified");

// 4 — Deadlines
await calculateDeadlines(SESSION_ID, USER_ID);
console.log("✓ 4. Deadlines calculated");

// 5 — Signal Letter
await generateSignalLetter(SESSION_ID, USER_ID);
console.log("✓ 5. Signal letter generated");

// 6 — Lex Counsel
const counsel = await sendCounselMessage(
  SESSION_ID, USER_ID,
  "What does clause 14 mean for my situation?"
);
console.log("✓ 6. Lex Counsel responded");
console.log("   Context-aware:", counsel.message.length > 0);

// 7 — Court Prep
await generateCourtPrep(SESSION_ID, USER_ID);
console.log("✓ 7. Court prep generated");

// 8 — Timeline
const events = await getTimeline(SESSION_ID, USER_ID);
console.log("✓ 8. Timeline:", events.length, "events");

// 9 — Health Check
await runHealthCheck(USER_ID, "California", {
  housing: true,
  employment: true,
  debt: false,
  disputes: true,
  recent_documents: true,
  government_letters: false,
  small_business: false
});
console.log("✓ 9. Health check complete");

// 10 — Alerts
const alerts = await getUserAlerts(USER_ID);
console.log("✓ 10. Alerts retrieved:", alerts.length);

// 11 — Library
const categories = getCategories();
console.log("✓ 11. Library categories:", categories.length);

// 12 — Outcome
await recordOutcome(
  SESSION_ID, USER_ID,
  "resolved_in_my_favour",
  "Signal letter caused landlord to back down"
);
console.log("✓ 12. Outcome recorded");

// Final timeline check
const finalEvents = await getTimeline(SESSION_ID, USER_ID);
console.log("\n✓ Final timeline events:", finalEvents.length);
finalEvents.forEach(e => console.log(`   - ${e.title}`));

// Cleanup
await db.collection("sessions").doc(SESSION_ID).delete();
console.log("\n✓ Cleanup complete");
console.log("\nAll 12 features working. Backend complete.");
