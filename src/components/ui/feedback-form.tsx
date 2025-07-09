import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Star } from 'lucide-react';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    type: 'feedback',
    rating: 0,
    subject: '',
    message: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        // Send email notification to support@intrinsai.com
        console.log('Feedback submitted - notification sent to support@intrinsai.com');
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFormData({
            type: 'feedback',
            rating: 0,
            subject: '',
            message: '',
            email: ''
          });
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Feedback Sent!</h3>
                  <p className="text-gray-400">
                    Thank you for your feedback. We'll get back to you at support@intrinsai.com
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Send Feedback</h3>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Feedback Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="feedback">General Feedback</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="support">Support Request</option>
                      </select>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rating (optional)
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            className={`p-1 transition-colors ${
                              star <= formData.rating
                                ? 'text-yellow-400'
                                : 'text-gray-600 hover:text-yellow-400'
                            }`}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Brief description of your feedback"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        placeholder="Please provide detailed feedback..."
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-center font-semibold transition-all duration-200 text-white flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Your feedback will be sent to support@intrinsai.com
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}