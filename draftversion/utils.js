/**
 * Created by josh on 6/28/16.
 */
var utils = {
    BASE_URL: 'http://joshondesign.com:39865',
    KEYCODES: {
        ESCAPE:27,
        ENTER:13,
    },
    getJSON: function(url,cb) {
        var url = this.BASE_URL+url;
        console.log("loading posts from",url);
        var xml = new XMLHttpRequest();
        var self = this;
        xml.onreadystatechange = function(e) {
            if(this.readyState == 4 && this.status == 200) {
                cb(xml.response);
            }
        };
        xml.responseType = 'json';
        xml.open("GET",url);
        xml.setRequestHeader('jauth',config.password);
        xml.send();
    },
    postJSON: function(url,payload,cb) {
        var url = this.BASE_URL+url;
        console.log("POST to",url,payload);
        var xml = new XMLHttpRequest();
        var self = this;
        xml.onreadystatechange = function(e) {
            if(this.readyState == 4 && this.status == 200) {
                cb(xml.response);
            }
        };
        xml.responseType = 'json';
        xml.open("POST",url);
        xml.setRequestHeader('jauth',config.password);
        var outstr = JSON.stringify(payload);
        xml.send(outstr);
    },
    getTextRelative: function(url, cb) {
        var xml = new XMLHttpRequest();
        xml.onreadystatechange = function(e) {
            if(this.readyState == 4 && this.status == 200) {
                cb(xml.response);
            }
        };
        xml.open("GET",url);
        xml.send();
    },
    toClass:function(def, cond) {
        var str = def.join(" ");
        for(var name in cond) {
            if(cond[name] === true) {
                str += " " + name
            }
        }
        return str;
    }
};
