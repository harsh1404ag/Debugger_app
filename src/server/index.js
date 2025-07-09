@@ .. @@
// Feedback endpoint
app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const { type, rating, subject, message, email } = req.body;
    const userId = req.user.userId;
    
    if (!type || !subject || !message) {
      return res.status(400).json({ error: 'Type, subject, and message are required' });
    }
    
    db.run(
      'INSERT INTO feedback (userId, type, rating, subject, message, email) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, rating || null, subject, message, email || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save feedback' });
        }
        
+        // TODO: Send email notification to support@intrinsai.com
+        // In production, integrate with email service (SendGrid, AWS SES, etc.)
+        console.log(`New feedback received - ID: ${this.lastID}`);
+        console.log(`Type: ${type}, Subject: ${subject}`);
+        console.log(`User: ${req.user.email}, Message: ${message}`);
+        console.log('Email notification should be sent to: support@intrinsai.com');
+        
        res.json({
          feedbackId: this.lastID,
          message: 'Feedback submitted successfully'
        });
      }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});