const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = __dirname;
const ENQUIRIES_FILE = path.join(__dirname, 'enquiries.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // Handle enquiry submission API
  if (req.method === 'POST' && req.url === '/api/enquiry') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const enquiry = JSON.parse(body);
        enquiry.timestamp = new Date().toISOString();
        
        // 1. Save to local enquiries.json file
        let enquiries = [];
        if (fs.existsSync(ENQUIRIES_FILE)) {
          const fileData = fs.readFileSync(ENQUIRIES_FILE, 'utf8');
          enquiries = JSON.parse(fileData || '[]');
        }
        enquiries.push(enquiry);
        fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2));

        // 2. Output to terminal console logs
        console.log('\n==================================================');
        console.log('📬 NEW ENQUIRY RECORDED (Saved to enquiries.json):');
        console.log(`Couple:  ${enquiry.coupleNames}`);
        console.log(`Email:   ${enquiry.email}`);
        console.log(`Phone:   ${enquiry.phone}`);
        console.log(`Date:    ${enquiry.weddingDate}`);
        console.log(`Guests:  ${enquiry.guestCount}`);
        console.log(`Theme:   ${enquiry.selectedTheme}`);
        console.log(`Notes:   ${enquiry.notes}`);
        console.log('==================================================\n');

        // Note: For production email dispatch, you can uncomment this block 
        // after installing nodemailer (npm install nodemailer):
        /*
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', // or your parent company SMTP host
          port: 587,
          secure: false, 
          auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password'
          }
        });
        
        const mailOptions = {
          from: '"Manam Studio" <no-reply@aprilgrid.com>',
          to: 'hello@aprilgrid.com',
          subject: `New Wedding Invitation Enquiry - ${enquiry.coupleNames}`,
          text: `A new enquiry has been submitted:\n\nCouple: ${enquiry.coupleNames}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nWedding Date: ${enquiry.weddingDate}\nTheme: ${enquiry.selectedTheme}\n\nNotes:\n${enquiry.notes}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log('Mail send error:', error);
          else console.log('Email sent successfully: ' + info.response);
        });
        */

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Enquiry saved locally.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid data format.' }));
      }
    });
    return;
  }

  // Handle static file serving
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Manam server running at http://localhost:${PORT}`);
  console.log(`Enquiries will be logged here and saved to: ${ENQUIRIES_FILE}`);
});
