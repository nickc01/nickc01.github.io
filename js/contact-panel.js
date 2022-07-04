// @ts-check


var contactPanel = {};


contactPanel.initialized = false;

contactPanel.destPercentage = 100;
contactPanel.currentPercentage = 100;

contactPanel.percentageSpeed = 7;

contactPanel.sendingEmail = false;

contactPanel.incrementTimer = 0;

contactPanel.incrementRateMin = 0.5;
contactPanel.incrementRateMax = 1.5;
contactPanel.incrementAmount = 10;

var root = document.querySelector(':root');


contactPanel.submit = function (event) {
    event.preventDefault();
    if (contactPanel.sendingEmail) {
        return;
    }
    contactPanel.initEmailJS();
    var btn = document.getElementById('send-email-button');
    var form = document.getElementById('contact-form');

    event.preventDefault();

    btn.value = 'Sending...';

    var serviceID = 'default_service';
    var templateID = 'template_as9n1gu';

    core.removeFromEvent(core.events.updateEvent, contactPanel.update);
    core.addToEvent(core.events.updateEvent, contactPanel.update);
    contactPanel.destPercentage = 0;
    contactPanel.sendingEmail = true;

    emailjs.sendForm(serviceID, templateID, form)
        .then(() => {
            if (btn) {
                btn.value = 'Email Sent!';
            }
            contactPanel.destPercentage = 100;
            contactPanel.sendingEmail = false;
            //alert('Sent!');
        }, (err) => {
            if (btn) {
                btn.value = 'Failed to Send';
            }
            contactPanel.destPercentage = 100;
            contactPanel.sendingEmail = false;
            //alert(JSON.stringify(err));
            console.error(JSON.stringify(err));
        });
}

contactPanel.initEmailJS = function() {
    if (!contactPanel.initialized && typeof emailjs != 'undefined') {
        emailjs.init('TOoglA9Tdn9-S4jtR');

        contactPanel.initialized = true;
    }
}


core.addToEvent(core.events.onEnterPanelEvent, panel => {
    if (panel.name != "contact") {
        return;
    }

    contactPanel.initEmailJS();

    document.getElementById('contact-form').addEventListener("submit", contactPanel.submit);
});

core.addToEvent(core.events.onPanelLeaveEvent, panel => {
    if (panel.name == "contact") {
        contactPanel.destPercentage = 100;
        contactPanel.currentPercentage = 100;
        contactPanel.incrementTimer = core.randomInRange(contactPanel.incrementRateMin, contactPanel.incrementRateMax);
        contactPanel.sendingEmail = false;
        contactPanel.updatePercentage();
        core.removeFromEvent(core.events.updateEvent, contactPanel.update);
    }
});




contactPanel.update = function (dt) {
    contactPanel.currentPercentage = core.lerp(contactPanel.currentPercentage, contactPanel.destPercentage, dt * contactPanel.percentageSpeed);
    if (contactPanel.sendingEmail) {
        contactPanel.incrementTimer -= dt;
        if (contactPanel.incrementTimer <= 0) {
            contactPanel.destPercentage += contactPanel.incrementAmount;
            if (contactPanel.destPercentage > 100) {
                contactPanel.destPercentage = 100;
            }
            contactPanel.incrementTimer = core.randomInRange(contactPanel.incrementRateMin, contactPanel.incrementRateMax);
        }
    }
    contactPanel.updatePercentage();
}

contactPanel.openContactPanel = function () {
    core.switchToPanel("contact");
}



contactPanel.updatePercentage = function () {
    root.style.setProperty('--progress-percentage', contactPanel.currentPercentage + "%");
}