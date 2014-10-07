# JQUERY is required
PUBLISHERDIV = "myPublisherDiv"
SUBSCRIBERDIV = "streamContainer"

window.OTTest_helper =
  getCredentials: ->
    xmlhttp=new XMLHttpRequest()
    xmlhttp.open("GET", "https://opentokrtc.com/songztest.json", false)
    xmlhttp.send()
    @data = JSON.parse(xmlhttp.response)
    return @data
  testAll: ->
    #@testSessionConnect()
    #@testPublisher()
    #@testSignal()
    @testPublisher(1)
  testSignal: ->
    @data = @data || @getCredentials()
    @connections = {}
    session = OT.initSession( @data.apiKey, @data.sid )
    session.connect @data.token, (err) ->
      console.log "connected to session"
# make sure to test with connection object and connectionId
      window.setInterval =>
        console.log("sending connection to myself via connectionId")
        console.log(session.connection.connectionId)
        session.signal {type: "test", data:"my face", to: session.connection}
      , 3000
    session.on "connectionCreated", (event) ->
      @connections[event.connection.connectionId] = event.connection
    session.on "signal", (event) ->
      console.log("EVENT SIGNAL RECEIVED")
      console.log(event)
  testSessionConnect: ->
    LogTest "testSessionConnect"
    @data = @data || @getCredentials()
    session = TB.initSession( @data.apiKey, @data.sid )
    session.connect @data.token, (err) ->
      if(err?)
        LogTest "sessionConnected: Error!"
      else
        LogTest "testSessionConnect: SUCCESS!"
  testPublisher: (type)->
    @data = @data || @getCredentials()
    type = type || 0
    self = @
    switch type
      when 0
        LogTest "testPublisher#{type}: without connecting to session"
        publisher = TB.initPublisher(@data.apiKey, PUBLISHERDIV)
        window.setTimeout =>
          LogTest "#{type} publisher should be destroyed"
          publisher.destroy()
          window.setTimeout ->
            self.testPublisher(type+1)
          , 5000
        , 5000
      when 1
        LogTest "testPublisher#{type}: create publisher, session connect, then session disconnect"
        publisher = TB.initPublisher(@data.apiKey, PUBLISHERDIV, {cameraName: "back"})
        session = TB.initSession( @data.apiKey, @data.sid )
        window.setTimeout ->
          LogTest "testPublisher#{type}: should seee publisher now"
          session.connect self.data.token, (err) ->
            LogTest "testPublisher#{type}: sessionConnected"
            if(err?) then return
            session.publish(publisher)
            session.on "sessionDisconnected", ->
              LogTest "#{type} publisher should be destroyed on sessionDisconnected"
              window.setTimeout ->
                self.testPublisher(type+1)
              , 5000
            window.setTimeout =>
              session.disconnect()
            , 5000
        , 5000
      when 2
        LogTest "testPublisher#{type}: create publisher in session connect, publisher destroy, then session disconnect"
        session = TB.initSession( @data.apiKey, @data.sid )
        session.connect @data.token, (err) =>
          if(err?) then return
          LogTest "testPublisher#{type}: sessionConnected"
          publisher = session.publish(PUBLISHERDIV)
          window.setTimeout =>
            LogTest "#{type} publisher should be destroyed"
            publisher.destroy()
            session.on "sessionDisconnected", =>
              LogTest "#{type} session disconnected should have no effect on publisher"
              window.setTimeout ->
                self.testPublisher(type+1)
              , 5000
            window.setTimeout =>
              session.disconnect()
            , 5000
          , 5000
      when 3
        LogTest "testPublisher#{type}: create publisher, swap camera, then disconnect"
        publisher = TB.initPublisher(@data.apiKey, PUBLISHERDIV)
        session = TB.initSession( @data.apiKey, @data.sid )
        cameraswap = 0
        window.setTimeout ->
          LogTest "testPublisher#{type}: should seee publisher now"
          session.connect self.data.token, (err) ->
            LogTest "testPublisher#{type}: sessionConnected"
            if(err?) then return
            session.publish(publisher)
            session.on "sessionDisconnected", ->
              LogTest "#{type} publisher should be destroyed on sessionDisconnected"
              window.setTimeout ->
                self.testPublisher(type+1)
              , 5000
            changeCamera = ->
              window.setTimeout =>
                if cameraswap > 5
                  session.disconnect()
                else
                  position = if cameraswap % 2 == 0 then "back" else "front"
                  publisher.setCameraPosition position
                  cameraswap += 1
                  changeCamera()
              , 5000
            changeCamera()
        , 5000
      else
        return

  startGroupVideoChat: () ->
    publisher = TB.initPublisher(data.apiKey, PUBLISHERDIV)
    publisher.on
      "streamCreated": (event) ->
        LogDebug( "publisher streamCreated", event )
      "streamDestroyed": (event) ->
        LogDebug( "publisher streamDestroyed", event )
    session = TB.initSession( data.apiKey, data.sid )
    session.on
      "signal": (event) ->
        LogDebug( "signalReceived", event )
      "connectionCreated": (event) ->
        LogDebug( "connectionCreated", event )
      "connectionDestroyed": (event) ->
        LogDebug( "connectionDestroyed", event )
      "streamDestroyed": (event) ->
        LogDebug( "streamDestroyed", event )
      "streamCreated": (event) ->
        LogDebug( "streamCreated", event )
        div = document.createElement('div')
        div.setAttribute('id', 'stream' + event.stream.streamId)
        document.getElementById(SUBSCRIBERDIV).appendChild(div)
        session.subscribe( event.stream, div.id, {width: 500, height: 500, subscribeToAudio: false} )
    session.connect data.token, (err) ->
      LogDebug "sessionConnected", err
      session.publish( publisher )
    return {session: session, publisher: publisher}

window.OTTest_session_disconnect = ->
  data = OTTest_helper.getCredentials()
  window.vChatElements = OTTest_helper.startGroupVideoChat( data )
  setTimeout ->
    console.log "whatever"
    #window.vChatElements.session.disconnect()
  , 10000

window.LogTest = (data) ->
  $("#currentTest").text(data)
window.LogDebug = (type, data) ->
  console.log( type, data )
  $("#loggingData").prepend("#{type}: #{JSON.stringify(data)}")
