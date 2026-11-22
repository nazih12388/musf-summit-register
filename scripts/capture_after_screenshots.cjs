const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'audit_screenshots', 'after');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const roles = [
  { name: 'login', user: null },
  {
    name: 'admin',
    user: { id: 'admin_1', username: 'admin', name: 'Directorate Admin', role: 'admin' }
  },
  {
    name: 'executive',
    user: { id: 'exec_1', username: 'musf_chairman', name: 'Ahmed Nihal', role: 'executive', designation: 'Chairman' }
  },
  {
    name: 'convener',
    user: { id: 'conv_1', username: 'convener_finearts', name: 'Salmanul Farisi', role: 'convener', designation: 'Fine Arts Convener', assignedWingId: 'fine_arts' }
  },
  {
    name: 'leader',
    user: { id: 'lead_1', username: 'leader_team_a', name: 'Muhammed Sinan', role: 'leader', teamId: 'team_a', leaderRole: 'leader1' }
  },
  {
    name: 'judge',
    user: { id: 'judge_1', username: 'judge_01', name: 'Prof. Abdul Kareem', role: 'judge' }
  },
  {
    name: 'student',
    user: { id: 'stu_1', username: 'cic_001', name: 'Abdullah K', role: 'student', cicNo: 'CIC/2026/001', classId: 'c1', teamId: 'team_a' }
  }
];

const viewports = [
  { label: 'desktop_1280', width: 1280, height: 900 },
  { label: 'phone_390', width: 390, height: 844, isMobile: true, hasTouch: true }
];

async function run() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  for (const r of roles) {
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.hasTouch });

      // Run before any page scripts execute
      await page.evaluateOnNewDocument((user) => {
        if (user) {
          localStorage.setItem('musf_summit_current_user_v6', JSON.stringify(user));
        } else {
          localStorage.removeItem('musf_summit_current_user_v6');
        }
        localStorage.setItem('musf_theme', 'light');
        sessionStorage.setItem('musf_splash_seen', 'true');
      }, r.user);

      await page.goto('http://localhost:5173/?nosplash=1', { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(res => setTimeout(res, 1200));

      const screenshotPath = path.join(outDir, `${r.name}_${vp.label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved AFTER screenshot: ${screenshotPath}`);
      await page.close();
    }
  }

  await browser.close();
  console.log('All AFTER screenshots captured successfully.');
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
