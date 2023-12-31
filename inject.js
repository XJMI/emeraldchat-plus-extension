(function (d, script) {
    script = d.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = function () {
        _.templateSettings = {
            interpolate: /\{\{(.+?)\}\}/g
        };
        profileTemplate = _.template('<div class="room-component-message-container" id="profileInfo"><div>\
            <div>Username  -  {{ username }}</div>\
            <div>Users Bio  -  {{ bio }}</div>\
            <div>Users Interests  -  {{ interestsText }}</div>\
            <div>Users Gender  -  {{ gender }}</div>\
            <div>Total Karma  -  {{ karma }}</div>\
            <div>Account Age  -  {{ created_since }}\
            <div>Room ID  -  {{ room_id }}\
           </div></div>');
    };
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js";
    d.getElementsByTagName('head')[0].appendChild(script);
}(document));

(function (d, script) {
    script = d.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.min.js";
    d.getElementsByTagName('head')[0].appendChild(script);
}(document));

var profileTemplate = "";
var firstFriend;
var savedMatch;
var matchRoomId = "";
var privateRoomId = "";

var saveMatchedRoom = function(){
    savedMatch = { messages: RoomClient.state.messages.slice(0), id: App.room.id };
};

var joinSavedMatch = function(){
    RoomClient.switch({ id: savedMatch.id, mode: "match" })
    RoomClient.state.messages = RoomClient.state.messages.concat(savedMatch.messages);
};

(function () {
    'use strict';

    setInterval(function () {
        /* hidden info logic */
        if (typeof RoomClient != "undefined" && RoomClient && RoomClient.state && RoomClient.state.current_partner && RoomClient.state.current_partner.id != matchRoomId && RoomClient.state.mode == "match") {
            matchRoomId = RoomClient.state.current_partner.id;

            var profile = Object.assign({}, RoomClient.state.current_partner);
            profile.created_since = moment(profile.created_at).fromNow();
            profile.interestsText = _.pluck(profile.interests, 'name').join(", ");

            var profileInfo = $("#profileInfo");
            if (profileInfo.length) {
                profileInfo.html(profileTemplate(profile));
            } else {
                jQuery("#messages").append(profileTemplate(profile));
            }
        }
        if (typeof RoomClient != "undefined" && RoomClient && RoomClient.state && RoomClient.state.id && RoomClient.state.id != privateRoomId && RoomClient.state.mode == "private") {
            
            var friendId = 0;
            if ( typeof RoomUserUnitClient != "undefined" ){
                friendId = [{user: { id: RoomUserUnitClient.props.data.id }}];
            } else {
                friendId = _.filter(RoomClient.state.messages, function(m){ return m.user.id !== App.user.id; });
            }
            console.log("private room changed", friendId, friendId.length);
            if ( friendId.length > 0 ){
                privateRoomId = RoomClient.state.id;
                friendId = friendId[0].user.id;
                $.ajax({
                    type: "GET",
                    url: "/profile_json?id=" + friendId ,
                    dataType: "json" ,
                    success: function(data){
                        var privateProfile = data.user;
                        console.log("friends profile", friendId, privateProfile);
                        privateProfile.created_since = moment(privateProfile.created_at).fromNow();
                        privateProfile.interestsText = _.pluck(privateProfile.interests, 'name').join(", ");
            
                        var privateProfileInfo = $("#profileInfo");
                        if (privateProfileInfo.length) {
                            privateProfileInfo.html(profileTemplate(privateProfile));
                        } else {
                            jQuery("#messages").append(profileTemplate(privateProfile));
                        }
                    }
                });                
            }
            
        }

    }, 1000);
})();