const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Gmail API.
	authorize(JSON.parse(content), listMsgs);
	//authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
			client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getNewToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
	const gmail = google.gmail({version: 'v1', auth});
	gmail.users.labels.list({
		userId: 'me',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const labels = res.data.labels;
		if (labels.length) {
			console.log('Labels:');
			labels.forEach((label) => {
				console.log(`- ${label.name} : ${label.id}`);
			});
		} else {
			console.log('No labels found.');
		}
	});
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listMsgs(auth) {
	const gmail = google.gmail({version: 'v1', auth});
	gmail.users.messages.list({
		userId: 'me',
		labelIds: ['Label_49']
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const labels = res.data.messages;
		if (labels.length) {
			console.log('Camera:');
			labels.forEach((message) => {
				console.log(`- ${message.id}`);
				gmail.users.messages.get({
				//gapi.client.gmail.users.messages.get({  
						userId: 'me',
						id : message.id
					},(err, res) => {
						if(err){
							console.log(err);
						}
						//console.log(res.data);
						/*
							data:
	 { id: '168f6fa0497360f6',
		 threadId: '168f6fa0497360f6',
		 labelIds:
			[ 'UNREAD', 'Label_49', 'Label_22', 'CATEGORY_PERSONAL', 'SENT' ],
		 snippet:
			'Dear User, Please check the attached picture for more information.',
		 historyId: '12219576',
		 internalDate: '1550331807000',
		 payload:
			{ partId: '',
				mimeType: 'multipart/mixed',
				filename: '',
				headers: [Array],
				body: [Object],
				parts: [Array] },
		 sizeEstimate: 317325 } }
		 */
						/*
							const msg = res.data.messages;
							if (msg.length) {
									console.log(" att : ", msg);
							}
						 */ 

						var parts = res.data.payload.parts;
							for (var i = 0; i < parts.length; i++) {
								var part = parts[i];
								if (part.filename && part.filename.length > 0) {
									var attachId = part.body.attachmentId;
									//var request = gapi.client.gmail.users.messages.attachments.get({
									var request = gmail.users.messages.attachments.get({  
										'id': attachId,
										'messageId': message.id,
										userId: 'me'
									},(err, res) => {
											console.log( res.data.data + "     ddddd");
											if(res.data.data){
var fs = require('fs');
// string generated by canvas.toDataURL()
var img =	res.data.data;
// strip off the data: url prefix to get just the base64-encoded bytes
var data = img.replace(/^data:image\/\w+;base64,/, "");
var buf = new Buffer(data, 'base64');
fs.writeFile('image.jpg', buf , function(err) {
    if (err) console.log(err);
    process.exit();	
});							
											}
											/*
data:
	 { size: 88966,
		 data:
			'_9j_4AAQSk .......
			*/                      
									});
									/*  
									request.execute(function(attachment) {
										//callback(part.filename, part.mimeType, attachment);
										console.log("aaa ", attachment);
									});
									*/
								}
							}             
				})
			});
		} else {
			console.log('No labels found.');
		}
	});
}
