import EmailQueue from '../models/EmailQueue.js';
import EmailCampaign from '../models/EmailCampaign.js';
import emailService from './emailService.js';

/**
 * Email Queue Manager
 * 
 * Manages scheduled emails and automatic email sequences
 */

/**
 * Queue an email based on campaign type and source
 */
export const queueEmailForContact = async (contact, campaignType, delayDays = 0) => {
  try {
    // Find active campaign matching type and source
    const campaign = await EmailCampaign.findOne({
      type: campaignType,
      $or: [
        { source: contact.source },
        { source: 'all' },
      ],
      isActive: true,
      delayDays: delayDays,
    }).sort({ createdAt: -1 }); // Get latest campaign

    if (!campaign) {
      console.log(`No campaign found for type: ${campaignType}, source: ${contact.source}, delay: ${delayDays} days`);
      return null;
    }

    // Calculate scheduled time
    const baseTime = new Date(contact.createdAt || new Date());
    const scheduledFor = new Date(baseTime.getTime() + delayDays * 24 * 60 * 60 * 1000);

    // Create queue entry
    const emailQueue = await EmailQueue.create({
      recipient: {
        email: contact.email,
        name: contact.name,
      },
      campaign: campaign._id,
      contact: contact._id,
      scheduledFor,
      status: 'pending',
      metadata: {
        source: contact.source,
        message: contact.message,
        improvement: contact.address, // Using address field for improvement if needed
      },
    });

    console.log(`✅ Queued email: ${campaignType} to ${contact.email} for ${scheduledFor.toISOString()}`);

    return emailQueue;
  } catch (error) {
    console.error('Error queueing email:', error);
    return null;
  }
};

/**
 * Queue email for user registration
 */
export const queueEmailForUser = async (user, campaignType, delayDays = 0) => {
  try {
    const campaign = await EmailCampaign.findOne({
      type: campaignType,
      $or: [
        { source: 'user_registration' },
        { source: 'all' },
      ],
      isActive: true,
      delayDays: delayDays,
    }).sort({ createdAt: -1 });

    if (!campaign) {
      console.log(`No campaign found for user type: ${campaignType}, delay: ${delayDays} days`);
      return null;
    }

    const baseTime = new Date(user.createdAt || new Date());
    const scheduledFor = new Date(baseTime.getTime() + delayDays * 24 * 60 * 60 * 1000);

    const emailQueue = await EmailQueue.create({
      recipient: {
        email: user.email,
        name: user.name,
      },
      campaign: campaign._id,
      user: user._id,
      scheduledFor,
      status: 'pending',
      metadata: {
        source: 'user_registration',
      },
    });

    console.log(`✅ Queued email: ${campaignType} to ${user.email} for ${scheduledFor.toISOString()}`);

    return emailQueue;
  } catch (error) {
    console.error('Error queueing email for user:', error);
    return null;
  }
};

/**
 * Initialize email sequence for a new contact
 */
export const initializeContactEmailSequence = async (contact) => {
  try {
    // Map source to initial email type
    const initialEmailMap = {
      'lead_magnet': 'welcome',
      'homepage': 'welcome',
      'exit_intent_popup': 'promotional',
      'other': 'welcome',
    };

    const initialType = initialEmailMap[contact.source] || 'welcome';

    // Queue immediate email
    await queueEmailForContact(contact, initialType, 0);

    // Queue follow-up emails based on source
    if (contact.source === 'lead_magnet') {
      // Educational content after 2 days
      await queueEmailForContact(contact, 'educational', 2);
      // Social proof after 5 days
      await queueEmailForContact(contact, 'follow_up', 5);
      // Soft offer after 7 days
      await queueEmailForContact(contact, 'promotional', 7);
    } else if (contact.source === 'homepage') {
      // Consultation offer after 1 day
      await queueEmailForContact(contact, 'follow_up', 1);
      // Detailed info after 3 days
      await queueEmailForContact(contact, 'educational', 3);
    } else if (contact.source === 'exit_intent_popup') {
      // Value proposition after 1 day
      await queueEmailForContact(contact, 'follow_up', 1);
      // Final reminder after 3 days
      await queueEmailForContact(contact, 'promotional', 3);
    }

    console.log(`✅ Initialized email sequence for contact: ${contact.email}`);
  } catch (error) {
    console.error('Error initializing email sequence:', error);
  }
};

/**
 * Initialize email sequence for a new user
 */
export const initializeUserEmailSequence = async (user) => {
  try {
    // Welcome email immediately
    await queueEmailForUser(user, 'welcome', 0);
    
    // Feature highlight after 2 days
    await queueEmailForUser(user, 'educational', 2);
    
    // Course promotion after 10 days
    await queueEmailForUser(user, 'promotional', 10);

    console.log(`✅ Initialized email sequence for user: ${user.email}`);
  } catch (error) {
    console.error('Error initializing user email sequence:', error);
  }
};

/**
 * Process pending emails (to be called by cron job)
 */
export const processEmailQueue = async () => {
  try {
    const now = new Date();
    const pendingEmails = await EmailQueue.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    })
      .populate('campaign')
      .limit(50); // Process 50 emails at a time

    console.log(`📧 Processing ${pendingEmails.length} pending emails...`);

    for (const emailQueue of pendingEmails) {
      try {
        if (!emailQueue.campaign) {
          console.warn(`Campaign not found for email queue ${emailQueue._id}`);
          continue;
        }

        // Replace template variables
        let html = emailQueue.campaign.htmlContent;
        html = html.replace(/\{\{name\}\}/g, emailQueue.recipient.name || 'Bạn');
        html = html.replace(/\{\{email\}\}/g, emailQueue.recipient.email);
        
        if (emailQueue.metadata) {
          if (emailQueue.metadata.message) {
            html = html.replace(/\{\{message\}\}/g, emailQueue.metadata.message);
          }
          if (emailQueue.metadata.improvement) {
            html = html.replace(/\{\{improvement\}\}/g, emailQueue.metadata.improvement);
          }
        }

        // Add unsubscribe link
        const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/unsubscribe?email=${encodeURIComponent(emailQueue.recipient.email)}&token=${emailQueue._id}`;
        html = html.replace(/\{\{unsubscribe_link\}\}/g, unsubscribeUrl);

        // Send email
        const result = await emailService.sendEmail({
          to: emailQueue.recipient.email,
          subject: emailQueue.campaign.subject,
          html,
          text: emailQueue.campaign.textContent || '',
        });

        // Update queue status
        emailQueue.status = 'sent';
        emailQueue.tracking.sentAt = new Date();
        emailQueue.tracking.deliveredAt = new Date(); // Assume delivered if no bounce
        emailQueue.save();

        // Update campaign metrics
        if (emailQueue.campaign.metrics) {
          emailQueue.campaign.metrics.sent += 1;
          emailQueue.campaign.metrics.delivered += 1;
          await emailQueue.campaign.save();
        }

        console.log(`✅ Sent email to ${emailQueue.recipient.email}`);
      } catch (error) {
        console.error(`❌ Error sending email to ${emailQueue.recipient.email}:`, error);
        
        emailQueue.sendAttempts += 1;
        emailQueue.lastAttemptAt = new Date();
        emailQueue.errorMessage = error.message;

        // Mark as failed after 3 attempts
        if (emailQueue.sendAttempts >= 3) {
          emailQueue.status = 'failed';
          if (emailQueue.campaign.metrics) {
            emailQueue.campaign.metrics.bounced += 1;
            await emailQueue.campaign.save();
          }
        }

        await emailQueue.save();
      }
    }
  } catch (error) {
    console.error('Error processing email queue:', error);
  }
};

