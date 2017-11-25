var express = require('express');
var steem = require('steem');
var fs = require('fs');
var sanitize = require("xss");
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('public'));

var urlencodedParser = bodyParser.urlencoded({ extended: false })
steem.api.setOptions({ url: 'wss://this.piston.rocks' });
var auth = fs.readFileSync(__dirname + "/auth").toString();
var steemUser = auth.substring(0, auth.indexOf(":"))
var wif =  auth.substring(auth.indexOf(":")+1)

// Basic url validation
function validateUrl(url)
{
    posA = url.indexOf("@");

    if (posA != -1)
    {
        url = url.substring(posA)

        posSlash = url.indexOf("/")

        if (posSlash != -1 && posSlash <= 17) // an username is 16 chars max + 1 for the @
        {
            username = url.substring(1, posSlash)
            identifier = url.substring(posSlash+1)
            console.log(username);
            console.log(identifier);
            if (identifier.length <= 255)
                    return [username, identifier]; //we have validated the url
        }
    }

    return ["",""];
}


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/main.html")
});


app.get('/post', function (req, res) {
    res.sendFile(__dirname + "/main.html")
});

app.post('/post', urlencodedParser, function (req,res) {

    var success = false;
    console.log("Reading the file");
    var content = fs.readFileSync(__dirname + "/main.html").toString();
    console.log("Sanitizing");
    var url = sanitize(req.body.url);
    console.log("validating");
    var data = validateUrl(url);
    if (data[0] != "" && data[1] != 0) {
        var username = data[0];
        var identifier = data[1];
        console.log("broadcasting");
        steem.broadcast.vote(wif, steemUser, username, identifier, 10, function(err, result) {

            if (err) {
                console.log(err, result);
                content += "<script> alert('Awww there was an error :( we probably already voted on your post.')</script>"
                console.log("error");
            }
            else {
                content += "<script> alert('Congratulations ! You got that precious upvote, enjoy it while you can ;)')</script>";
                success = true;
                console.log("git gud");
            }
            console.log("sending the page");
            res.send(content);
            res.end();
            console.log("end of the broadcast");
        });
        console.log("setting the timeout");
            setTimeout(function () {
                if (success) {
                    console.log("unvoting");
                    steem.broadcast.vote(wif, steemUser, username, identifier, 0, function (err, result) {
                        if (err) {
                            console.log("error while unvoting");
                            console.log(err);
                        }
                        success = false;
                        console.log("exiting timeout");
                    });
                }
            }, 20 * 1000);
        console.log("exiting timeout");
    } else {
        content += "<script> alert('Awww there was an error :( we probably already voted on your post.')</script>";
        console.log("error sending page");
        res.send(content);
        res.end();
    }
    console.log("Completely done");
});

app.listen(80, function () {
    console.log("Nopebot is ready to go !")
});

