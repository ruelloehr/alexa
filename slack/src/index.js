// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.

/**
 * App ID for the skill
 */
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');
var qs = require('qs');

var channel;

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to download history content from Wikipedia
 */
var urlPrefix = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext=&exsectionformat=plain&redirects=&titles=';

/**
 * Variable defining number of events to be read at one time
 */
var paginationSize = 3;

/**
 * Variable defining the length of the delimiter between events
 */
var delimiterSize = 2;

/**
 * SlackSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var SlackSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SlackSkill.prototype = Object.create(AlexaSkill.prototype);
SlackSkill.prototype.constructor = SlackSkill;

SlackSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("SlackSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

SlackSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("SlackSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

SlackSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

SlackSkill.prototype.intentHandlers = {

    GetFirstEventIntent: function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },

    GetNextEventIntent: function (intent, session, response) {
        handleNextEventRequest(intent, session, response);
    },

    HelpIntent: function (intent, session, response) {
        var speechOutput = "With slack, you can post messages to a channel. " +
            "Now, which channel do you want to post to?";
        response.ask(speechOutput);
    },

    FinishIntent: function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Post to slack channel";
    var repromptText = "With slack you can post a message to a channel.  Now which channel would you like to post to?";
    var speechOutput = "Slack.  Which channel do you want to post to?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    response.askWithCard(speechOutput, repromptText, cardTitle, speechOutput);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleFirstEventRequest(intent, session, response) {
    channel = intent.slots.channel;

    var repromptText = "With slack you can post a message to a channel.  Now which channel would you like to post to?";

    response.ask('Ok, great. What message would you like to post?', repromptText);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleNextEventRequest(intent, session, response) {
    console.log('channel is ' + channel.value);
    console.log('message is ' + intent.slots.message);


    var message = intent.slots.message;

console.log('the message is ' + message.value);

    var msgString = qs.stringify({text: message.value});

    console.log('msgString is ' + msgString);

    //insert token below
    var options = {
        host: 'slack.com',
        path: '/api/chat.postMessage?token=&channel=%23ruel-test&'  + msgString + '&as_user=ruelloehr&pretty=1'
    };

    var callback = function(cbResponse) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        cbResponse.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        cbResponse.on('end', function () {
            response.tell('Ok, I have posted your message');
        });
    }

    https.request(options, callback).end();

}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new SlackSkill();
    skill.execute(event, context);
};

