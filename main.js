var express = require('express');
var steem = require('steem');
var fs = require('fs');
var sanitize = require("xss");

var app = express();
app.use(express.static('public'));

steemUser = "";
steemPassword =  "";

var wif = steem.auth.toWif(steemUser, steemPassword, 'posting');

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
            {
                //if (/^[a-z1-9\-]+$/.test(identifier) && /^[a-z]+$/.test(username)) { // todo : fix that
                    return [username, identifier]; //we have validated the url
                //}
            }
        }
    }

    return ["",""];
}


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/main.html")
});


app.get('/get', function (req,res) {
    var content = fs.readFileSync(__dirname + "/main.html").toString();
    var url = sanitize(req.query.url);
    var data = validateUrl(url);
    console.log(data);
    if (data[0] != "" && data[1] != 0) {

        var username = data[0];
        var identifier = data[1];

        steem.broadcast.vote(wif, steemUser, username, identifier, 10, function(err, result) {
            if (err)
                content += "<script> alert('Awww there was an error :( we probably already voted on your post.')</script>";
            else {
                content += "<script> alert('Congratulations ! You got that precious upvote, enjoy it while you can ;)')</script>";
                setTimeout(function(){
                    steem.broadcast.vote(wif, steemUser, username, identifier, 0)
                }, 720 * 1000);
            }
            res.send(content);
            res.end();

            return;
        });
    } else {
        content += "<script> alert('Awww there was an error :( we probably already voted on your post.')</script>";
        res.send(content);
        res.end();
    }
});

app.listen(80, function () {
    console.log("Example app listening at http://localhost:8081")
})

