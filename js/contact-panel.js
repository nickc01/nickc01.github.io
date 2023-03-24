// @ts-check

//Contains code and controls associated with the "Contact" panel

var contactPanel = {};

/** Is the contact panel initialized? */
contactPanel.initialized = false;

/** Stores the destination percentage of the button gradient effect */
contactPanel.destPercentage = 100;

/** Stores the current percentage of the button gradient effect */
contactPanel.currentPercentage = 100;

/** How fast the current percentage should interpolate to the destination percentage */
contactPanel.percentageInterpSpeed = 7;

/** Is true if an email is currently being sent */
contactPanel.sendingEmail = false;

/** Used for incrementing the percentage */
contactPanel.incrementTimer = 0;

/** The minimum amount of time to wait before incrementing the percentage */
contactPanel.incrementRateMin = 0.5;

/** The maximum amount of time to wait before incrementing the percentage */
contactPanel.incrementRateMax = 1.5;

/** How much the destination percentage should increase when an increment action occurs */
contactPanel.incrementAmount = 10;

var root = document.querySelector(':root');


/** Called when the "Send" button is clicked in the UI */
contactPanel.submit = function(event) {
    event.preventDefault();
    //Stop if we are already sending an email
    if (contactPanel.sendingEmail) {
        return;
    }
    //Initialize Email.JS
    contactPanel.initEmailJS();
    //Get the send button
    var btn = document.getElementById('send-email-button');
    //Get the main form
    var form = document.getElementById('contact-form');

    //Change the button text
    btn.value = 'Sending...';

    var serviceID = 'default_service';
    var templateID = 'template_as9n1gu';

    //Add the update event if it's not already added
    if (!core.containsEvent(core.events.updateEvent, contactPanel.update)) {
        core.addToEvent(core.events.updateEvent, contactPanel.update);
    }

    //Set the destination percentage to 0
    contactPanel.destPercentage = 0;
    contactPanel.sendingEmail = true;

    //Attempt to send an email
    emailjs.sendForm(serviceID, templateID, form)
        .then(() => {
            //If successful, then update the button text
            if (btn) {
                btn.value = 'Email Sent!';
            }
            contactPanel.destPercentage = 100;
            contactPanel.sendingEmail = false;
        }, (err) => {
            //If unsuccessful, then also update the text
            if (btn) {
                btn.value = 'Failed to Send';
            }
            contactPanel.destPercentage = 100;
            contactPanel.sendingEmail = false;
            //Print the error to the console
            console.error(JSON.stringify(err));
        });
}

/** Initializes Email.JS if it's not already intitialized */
contactPanel.initEmailJS = function() {
    //if the contact panel isn't already initialized
    if (!contactPanel.initialized && typeof emailjs != 'undefined') {
        //Initialize Email.JS
        emailjs.init('TOoglA9Tdn9-S4jtR');

        contactPanel.initialized = true;
    }
}

//Adds an event that's called whenever a new panel loads
core.addToEvent(core.events.onEnterPanelEvent, panel => {
    //If the contact panel has not loaded, then exit
    if (panel.name != "contact") {
        return;
    }

    //If we are in the contact panel, then initialize email.js and hook into the "Send" button's submit event
    contactPanel.initEmailJS();

    document.getElementById('contact-form').addEventListener("submit", contactPanel.submit);
});

//Adds an event that's called whenever a panel unloads
core.addToEvent(core.events.onPanelLeaveEvent, panel => {
    //if the contact panel is unloading
    if (panel.name == "contact") {
        //Reset the variables
        contactPanel.destPercentage = 100;
        contactPanel.currentPercentage = 100;
        contactPanel.incrementTimer = core.randomInRange(contactPanel.incrementRateMin, contactPanel.incrementRateMax);
        contactPanel.sendingEmail = false;
        contactPanel.updatePercentage();
        //Unhook the update event
        core.removeFromEvent(core.events.updateEvent, contactPanel.update);
    }
});



/**
 * Called once every frame
 * @param {number} dt The amount of time since the last update
 */
contactPanel.update = function(dt) {
    //Interpolates the current percentage to the destination percentage
    contactPanel.currentPercentage = core.lerp(contactPanel.currentPercentage, contactPanel.destPercentage, dt * contactPanel.percentageInterpSpeed);
    //If we are sending an email
    if (contactPanel.sendingEmail) {
        //Decrease the increment timer
        contactPanel.incrementTimer -= dt;
        //If the increment timer is low enough
        if (contactPanel.incrementTimer <= 0) {
            //Increase the destPercentage by the increment amount
            contactPanel.destPercentage += contactPanel.incrementAmount;
            //Clamp if necessary
            if (contactPanel.destPercentage > 100) {
                contactPanel.destPercentage = 100;
            }
            //Re-randomize the increment timer
            contactPanel.incrementTimer = core.randomInRange(contactPanel.incrementRateMin, contactPanel.incrementRateMax);
        }
    }
    //Updates the button's color to reflect the percentage value
    contactPanel.updatePercentage();
}

/** Called from the "Home" panel to open the contact panel */
contactPanel.openContactPanel = function() {
    core.switchToPanel("contact");
}


/** Used to update the progress percentage in CSS to update the color on the "Send" button */
contactPanel.updatePercentage = function() {
    root.style.setProperty('--progress-percentage', contactPanel.currentPercentage + "%");
}

console.log("Contact Panel Loaded");