var express = require('express');
var steem = require('steem');
var fs = require('fs');
var sanitize = require("xss");

var app = express();
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + "/index.html")
});

function validate_url(url)
{
    aro = url.find("@");

    if (url[0] == "@")
    {

    }


    return false;


}


app.get('/process_get', function (req,res) {

    url = sanitize(req.query.url);

    validate_url(url);

    console.log(url);

    res.sendfile(__dirname + "/index.html")

})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})

