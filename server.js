require('dotenv').config();
const app = require('./src/app');
const { PORT } = require('./src/config/env');
const { startActivityTracker } = require('./src/jobs/activityTracker');

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  startActivityTracker();
});
