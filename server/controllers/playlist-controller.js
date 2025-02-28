const Playlist = require('../models/playlist-model')
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/

//shreyas edits for changing playlist name//

updatePlaylistById = async(req,res) => {
    const body = req.body;
    console.log("Entered update playlist by id");
    console.log("updatePlaylistById: " + body);
    if(!body){
        return res.status(400).json({

            success: false, 
            error: 'No body to update'
        })
    }
    Playlist.findOne({ _id:req.params.id},(err,playlist)=>{
        if(err){
            console.log("Shreyas  Check find One")
            return res.status(400).json({success: false, error:err});

        }
        playlist.name =body.name;
        playlist.songs=body.songs;
        

        //
        playlist
            .save()
            .then ( () =>{
                return res.status(201).json({
                    success: true,
                    playlist: playlist,

                    message:'Playlist is Updated Now'
                })
            })
            .catch (error =>{
                return res.status(400).json({
                    error,
                    message: "Playlist was NOT Updated!"
                })
            })

    }).catch(err => console.log( err ) ) 

}

deletePlaylistById=async(req,res) => {
    console.log("Inside delete Playlist By Id, Shreyas");
    await Playlist.findOneAndDelete({ _id:req.params.id},(err)=>{
        if(err){
            return res.status(400).json(
                {success: false, error:err}
            )

        }
        return res.status(200).json({success:true }) //works properly, so return 200 OK
    }).catch(err=>console.log(err))    
}



//shreyas edits end-----

createPlaylist = (req, res) => {
    console.log("Shreyas Test Create Playlist") ;
    const body = req.body;
    console.log("createPlaylist body: " + body);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You should provide a playlist',
        })
    }

    const playlist = new Playlist(body);
    console.log("playlist: " + JSON.stringify(body));
    if (!playlist) {
        return res.status(400).json({ success: false, error: err })
    }

    playlist
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                playlist: playlist,
                message: 'Playlist Created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Playlist Not Created!',
            })
        })
}
getPlaylistById = async (req, res) => {
    await Playlist.findOne({ _id: req.params.id }, (err, list) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        return res.status(200).json({ success: true, playlist: list })
    }).catch(err => console.log(err))
}
getPlaylists = async (req, res) => {
    await Playlist.find({}, (err, playlists) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!playlists.length) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    }).catch(err => console.log(err))
}
getPlaylistPairs = async (req, res) => {
    await Playlist.find({}, (err, playlists) => {
        if (err) {
            return res.status(400).json({ success: false, error: err})
        }
        if (!playlists.length) {
            return res
                .status(404)
                .json({ success: false, error: 'Playlists not found'})
        }
        else {
            // PUT ALL THE LISTS INTO ID, NAME PAIRS
            let pairs = [];
            for (let key in playlists) {
                let list = playlists[key];
                let pair = {
                    _id : list._id,
                    name : list.name
                };
                pairs.push(pair);
            }
            return res.status(200).json({ success: true, idNamePairs: pairs })
        }
    }).catch(err => console.log(err))
}

module.exports = {
    createPlaylist,
    getPlaylists,
    getPlaylistPairs,
    getPlaylistById,
    updatePlaylistById,
    deletePlaylistById
}