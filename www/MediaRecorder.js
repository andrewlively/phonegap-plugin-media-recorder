/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/
/* globals Promise, cordova, DOMException, fetch */
var exec = cordova.require('cordova/exec');

var MediaRecorder = function (stream, options) {
    this.stream = stream;
    this._url = null;

    // bad code -- just wiring things up - will improve soon
    if (options === undefined) {
        this.mimeType = '';
        this.videoBitsPerSecond = 0;
        this.audioBitsPerSecond = 0;
    }
    this.state = 'inactive';
    this.onstart = function () {};
    this.onstop = function () {};
    this.ondataavailable = function () {};
    this.onpause = function () {};
    this.onresume = function () {};
    this.onerror = function () {};
};

MediaRecorder.prototype.start = function (timeslice) {
    if (this.state !== 'inactive') {
        throw new DOMException('', 'InvalidStateError');
    } else {
        this.state = 'recording';
        if (!timeslice) {
            timeslice = Number.MAX_SAFE_INTEGER;
        }
        var that = this;
        var success = function (info) {
            if (info.state === 'recording') {
                that.onstart();
            } else if (info.state === 'inactive') {
                that._url = info.url;
                that.onstop();
            }
        };
        var fail = function (error) {
            console.log(error);
        };
        var video = '';
        //  fails when no audio and/or video tracks present - needs to be fixed in media stream
        var videoTrack = this.stream.getVideoTracks()[0];
        if (videoTrack) {
            video = videoTrack.description;
        }
        var audio = false;
        var audioTrack = this.stream.getAudioTracks()[0];
        if (audioTrack) {
            audio = true;
        }
        var args = [timeslice,video,audio];
        exec(success, fail, 'MediaRecorder', 'start', args);
    }
};

MediaRecorder.prototype.stop = function () {
    if (this.state === 'inactive') {
        throw new DOMException('', 'InvalidStateError');
    } else {
        this.state = 'inactive';
        var that = this;
        var success = function (info) {
            that.onstop();
        };
        var fail = function (error) {
            console.log(error);
        };
        exec(success, fail, 'MediaRecorder', 'stop', []);
    }
};

MediaRecorder.prototype.pause = function () {
    if (this.state === 'inactive') {
        throw new DOMException('', 'InvalidStateError');
    } else {
        this.state = 'paused';
        var that = this;
        var success = function (info) {
            that.onpause();
        };
        var fail = function (error) {
            console.log(error);
        };
        exec(success, fail, 'MediaRecorder', 'pause', []);
    }
};

MediaRecorder.prototype.resume = function () {
    if (this.state === 'inactive') {
        throw new DOMException('', 'InvalidStateError');
    } else {
        this.state = 'recording';
        var that = this;
        var success = function (info) {
            that.onresume();
        };
        var fail = function (error) {
            console.log(error);
        };
        exec(success, fail, 'MediaRecorder', 'resume', []);
    }
};

MediaRecorder.prototype.requestData = function () {
    var that = this;
    // works on ios 10.3 and above
    fetch(this._url).then(function (response) {
        return response.blob();
    }).then(function (blob) {
        that.ondataavailable(blob);
    });
};

MediaRecorder.prototype.isTypeSupported = function (type) {
    // return true/false;
};

module.exports = MediaRecorder;
