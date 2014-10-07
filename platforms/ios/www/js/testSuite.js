// Generated by CoffeeScript 1.7.1
(function() {
  var PUBLISHERDIV, SUBSCRIBERDIV;

  PUBLISHERDIV = "myPublisherDiv";

  SUBSCRIBERDIV = "streamContainer";

  window.OTTest_helper = {
    getCredentials: function() {
      var xmlhttp;
      xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", "https://opentokrtc.com/songztest.json", false);
      xmlhttp.send();
      this.data = JSON.parse(xmlhttp.response);
      return this.data;
    },
    testAll: function() {
      return this.testSignal();
    },
    testSignal: function() {
      var session;
      this.data = this.data || this.getCredentials();
      this.connections = {};
      session = OT.initSession(this.data.apiKey, this.data.sid);
      session.connect(this.data.token, function(err) {
        console.log("connected to session");
        return window.setInterval((function(_this) {
          return function() {
            console.log("sending connection to myself via connectionId");
            console.log(session.connection.connectionId);
            return session.signal({
              type: "test",
              data: "my face",
              to: session.connection
            });
          };
        })(this), 3000);
      });
      session.on("connectionCreated", function(event) {
        return this.connections[event.connection.connectionId] = event.connection;
      });
      return session.on("signal", function(event) {
        console.log("EVENT SIGNAL RECEIVED");
        return console.log(event);
      });
    },
    testSessionConnect: function() {
      var session;
      LogTest("testSessionConnect");
      this.data = this.data || this.getCredentials();
      session = TB.initSession(this.data.apiKey, this.data.sid);
      return session.connect(this.data.token, function(err) {
        if ((err != null)) {
          return LogTest("sessionConnected: Error!");
        } else {
          return LogTest("testSessionConnect: SUCCESS!");
        }
      });
    },
    testPublisher: function(type) {
      var publisher, self, session;
      this.data = this.data || this.getCredentials();
      type = type || 0;
      self = this;
      switch (type) {
        case 0:
          LogTest("testPublisher" + type + ": no session");
          publisher = TB.initPublisher(this.data.apiKey, PUBLISHERDIV);
          return window.setTimeout((function(_this) {
            return function() {
              LogTest("" + type + " publisher should be destroyed");
              publisher.destroy();
              return window.setTimeout(function() {
                return self.testPublisher(type + 1);
              }, 20000);
            };
          })(this), 5000);
        case 1:
          LogTest("testPublisher" + type + ": create publisher then session connect");
          publisher = TB.initPublisher(this.data.apiKey, PUBLISHERDIV);
          session = TB.initSession(this.data.apiKey, this.data.sid);
          return window.setTimeout(function() {
            LogTest("testPublisher" + type + ": should seee publisher now");
            return session.connect(self.data.token, function(err) {
              LogTest("testPublisher" + type + ": sessionConnected");
              if ((err != null)) {
                return;
              }
              session.publish(publisher);
              session.on("sessionDisconnected", function() {
                LogTest("" + type + " publisher should be destroyed on sessionDisconnected");
                return window.setTimeout(function() {
                  return self.testPublisher(type + 1);
                }, 5000);
              });
              return window.setTimeout((function(_this) {
                return function() {
                  return session.disconnect();
                };
              })(this), 5000);
            });
          }, 5000);
        case 2:
          LogTest("testPublisher" + type + ": create publisher in session connect");
          session = TB.initSession(this.data.apiKey, this.data.sid);
          return session.connect(this.data.token, (function(_this) {
            return function(err) {
              if ((err != null)) {
                return;
              }
              LogTest("testPublisher" + type + ": sessionConnected");
              publisher = session.publish(PUBLISHERDIV);
              return window.setTimeout(function() {
                LogTest("" + type + " publisher should be destroyed");
                publisher.destroy();
                session.on("sessionDisconnected", function() {
                  LogTest("" + type + " session disconnected should have no effect on publisher");
                  return window.setTimeout(function() {
                    return self.testPublisher(type + 1);
                  }, 5000);
                });
                return window.setTimeout(function() {
                  return session.disconnect();
                }, 5000);
              }, 30000);
            };
          })(this));
      }
    },
    startGroupVideoChat: function(data) {
      var publisher, session;
      publisher = TB.initPublisher(data.apiKey, PUBLISHERDIV);
      publisher.on({
        "streamCreated": function(event) {
          return LogDebug("publisher streamCreated", event);
        },
        "streamDestroyed": function(event) {
          return LogDebug("publisher streamDestroyed", event);
        }
      });
      session = TB.initSession(data.apiKey, data.sid);
      session.on({
        "signal": function(event) {
          return LogDebug("signalReceived", event);
        },
        "connectionCreated": function(event) {
          return LogDebug("connectionCreated", event);
        },
        "connectionDestroyed": function(event) {
          return LogDebug("connectionDestroyed", event);
        },
        "streamDestroyed": function(event) {
          return LogDebug("streamDestroyed", event);
        },
        "streamCreated": function(event) {
          var div;
          LogDebug("streamCreated", event);
          div = document.createElement('div');
          div.setAttribute('id', 'stream' + event.stream.streamId);
          document.getElementById(SUBSCRIBERDIV).appendChild(div);
          return session.subscribe(event.stream, div.id, {
            width: 500,
            height: 500,
            subscribeToAudio: false
          });
        }
      });
      session.connect(data.token, function(err) {
        LogDebug("sessionConnected", err);
        return session.publish(publisher);
      });
      return {
        session: session,
        publisher: publisher
      };
    }
  };

  window.OTTest_session_disconnect = function() {
    var data;
    data = OTTest_helper.getCredentials();
    window.vChatElements = OTTest_helper.startGroupVideoChat(data);
    return setTimeout(function() {
      return console.log("whatever");
    }, 10000);
  };

  window.LogTest = function(data) {
    return $("#currentTest").text(data);
  };

  window.LogDebug = function(type, data) {
    console.log(type, data);
    return $("#loggingData").prepend("" + type + ": " + (JSON.stringify(data)));
  };

}).call(this);
