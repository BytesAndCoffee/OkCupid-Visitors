// ==UserScript==
// @name         My Fancy New Userscript
// @namespace    http://www.okcupid.com/*
// @version      0.1
// @description  enter something useful
// @author       You
// @match        *://www.okcupid.com/*
// @require          https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @grant      GM_addStyle
// ==/UserScript==
if (typeof $ == 'undefined') {
    $ = unsafeWindow.jQuery;
}
GM_addStyle(".spinner{-webkit-animation:rotator 1.4s linear infinite;animation:rotator 1.4s linear infinite}@-webkit-keyframes rotator{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(270deg);transform:rotate(270deg)}}@keyframes rotator{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(270deg);transform:rotate(270deg)}}.path{stroke-dasharray:187;stroke-dashoffset:0;-webkit-transform-origin:center;-ms-transform-origin:center;transform-origin:center;-webkit-animation:dash 1.4s ease-in-out infinite,colors 5.6s ease-in-out infinite;animation:dash 1.4s ease-in-out infinite,colors 5.6s ease-in-out infinite}@-webkit-keyframes colors{0%{stroke:#4285F4}25%{stroke:#DE3E35}50%{stroke:#F7C223}75%{stroke:#1B9A59}100%{stroke:#4285F4}}@keyframes colors{0%{stroke:#4285F4}25%{stroke:#DE3E35}50%{stroke:#F7C223}75%{stroke:#1B9A59}100%{stroke:#4285F4}}@-webkit-keyframes dash{0%{stroke-dashoffset:187}50%{stroke-dashoffset:46.75;-webkit-transform:rotate(135deg);transform:rotate(135deg)}100%{stroke-dashoffset:187;-webkit-transform:rotate(450deg);transform:rotate(450deg)}}@keyframes dash{0%{stroke-dashoffset:187}50%{stroke-dashoffset:46.75;-webkit-transform:rotate(135deg);transform:rotate(135deg)}100%{stroke-dashoffset:187;-webkit-transform:rotate(450deg);transform:rotate(450deg)}}#sidebar{position:fixed;background:#e2eafa;border-radius:3px;padding:8px 5px 5px;margin-left:10px;margin-right:10px;margin-top:50px;width:295px;min-height:360px}.user{display:inline-block;padding:5px;margin-bottom:-5px;border-radius:3px}h1{font-size:larger}");
var spinner = '<svg class=spinner width=65px height=65px viewBox="0 0 66 66" xmlns=http://www.w3.org/2000/svg><circle class=path fill=none stroke-width=6 stroke-linecap=round cx=33 cy=33 r=30></circle></svg>';
$('#navigation').after($('<div id="sidebar" width="295" height="360">' + spinner + '</div>'));
var prefix = "http:";
if (location.protocol === 'https:') {
    prefix = "https:";
}

function httpGet(theUrl) {
    var deferred = $.Deferred();
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.addEventListener('load', function() {
        if (xmlHttp.status === 200) {
            deferred.resolve(xmlHttp.response);
        } else {
            deferred.reject("HTTP error: " + xmlHttp.status);
        }
    }, false);
    xmlHttp.send(null);
    return deferred.promise();
}

function setMatches(elm) {
    $('#matches').html($(elm).attr('data'));
}

function insertMatches(url, elm) {
    if ($(elm).attr('data') === undefined) {
        var me = httpGet(prefix + '//www.okcupid.com/profile?okc_api=1');
        var e = $(elm);
        me.done(function(data) {
            var profile = JSON.parse(data);
            var access = profile.authcode;
            url = prefix + '//www.okcupid.com/apitun/profile/' + url + '?access_token=' + access;
            var promise = httpGet(url);
            promise.done(function(data) {
                var page = JSON.parse(data);
                var match = Math.round(page.match_percentages.match / 100);
                var enemy = Math.round(page.match_percentages.enemy / 100);
                var match2 = Math.round(Math.sqrt(match * (100 - enemy)));
                var title = '' + match + '% | ' + enemy + '% | ' + match2 + '%';
                e.attr('data', title);
                setMatches(elm);
                e.mouseenter(function() {
                    setMatches(elm);
                });
            });
        });
    }
}
var promise = httpGet(prefix + '//www.okcupid.com/visitors?okc_api=1');
promise.done(function(data) {
    String.prototype.repeat = function(num) {
        return new Array(num + 1).join(this);
    };
    var users = JSON.parse(data).stalkers;
    console.log(users);
    var userrow = '<div class="row">' + '<div class="user"></div>'.repeat(3) + '</div>';
    var userbox = '<div id="userbox"><hr><center><h1>Mouse over a user above</h1></center></div>';
    $('#sidebar').html('<center><h1>Visitors</h1></center>' + userrow.repeat(3) + userbox);
    var grid = $('[class=user]');
    $(users).each(function(index) {
        var user = $(grid[index]);
        console.log(this.picid);
        user.attr({
            img: "https://k2.okccdn.com/php/load_okc_image.php/images/225x225/225x225/0x158/960x1119/2/" + this.picid + ".jpg",
            name: this.username
        });
        user.html(function() {
            var name = user.attr('name');
            var img = user.attr('img');
            return '<a href=/profile/' + name + '><img src=' + img + ' width="85" height="85"></a>';
        });
        user.mouseenter(function() {
            var elm = user;
            $('#userbox > center > h1').html(elm.find('a').html() + '<br>' + elm.attr('name') + '<br> <div id="matches"><br></div>');
            insertMatches(elm.attr('name'), this);
        });
        //console.log(user);
    });
});
