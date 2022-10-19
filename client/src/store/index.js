import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api, { getAllPlaylists } from '../api'
import AddSong_Transaction from '../transactions/AddSong_Transaction';
import DeleteSong_Transaction from '../transactions/DeleteSong_Transaction';
import MoveSong_Transaction from '../transactions/MoveSong_Transaction';
import EditSong_Transaction from '../transactions/EditSong_Transaction';

export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    UPDATE_LIST: "UPDATE_LIST"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.playlist,
                    newListCounter: store.newListCounter,
                    listNameActive: false
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false
                })
            }
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter + 1,
                    listNameActive: false
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listMarkedForDeletion: payload

                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    listNameActive: false
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    listNameActive: true
                });
            }

            // START Updating list, for adding song atm
            case GlobalStoreActionType.UPDATE_LIST: {
                console.log("inside UPDATE_LIST case")
                    return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    listNameActive: true,
                    //maybe add more later, will look into
                });
            }

            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        console.log("entered the store index.js changeListName");
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                playlist.name = newName;
                async function updateList(playlist) {
                    //errors on this response
                    response = await api.updatePlaylistById(playlist._id, playlist);
                    if (response.data.success) {
                        async function getListPairs(playlist) {
                            response = await api.getPlaylistPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        playlist: playlist
                                    }
                                });
                            }
                        }
                        getListPairs(playlist);
                    }
                }
                updateList(playlist);
            }
        }
        asyncChangeListName(id);
    }

    //shreyas trying delete list
    
    store.markListForDelete = function (id){
        console.log("entered store mark list for delete");
        console.log( "id: "+ id);
        storeReducer({
            type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
            payload: id
        });
        store.showDeleteListModal();

    }
    store.showDeleteListModal =function(){
        let modal=document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    store.hideDeleteListModal =function(){
        let modal=document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }
    store.deleteMarkedList=function(){
        console.log("entered deleteMarkedList");

        console.log(store.listMarkedForDeletion.id);
        store.deleteList(store.listMarkedForDeletion);
        store.hideDeleteListModal();
    }
    store.deleteList = function(id){
        console.log("entered deleteList");
        console.log( "id:  "+id);
        async function deletePro(id){
            let response = await api.deletePlaylistById(id);
            if(response.data.success)     {
                store.loadIdNamePairs();
                store.history.push("/");
            }   
        }
        deletePro(id);
    }
    

    //shreyas trying to add new list 
    store.createNewList = function(){
        console.log("entered createNewList");
        async function asyncCreateNewList(){
            console.log("entered async createNewList");
            let newList1 ={
                "name": "Untitled",
                "songs": []
            };
        
        const response = await api.createPlaylist(newList1);
        if(response.data.success){
            //if response successfully comes thru
            console.log("if response data success store");
            let newPlaylist1 = response.data.playlist; //will plug this new playlist into 
            storeReducer({
               type: GlobalStoreActionType.CREATE_NEW_LIST, payload:newPlaylist1 
            });
            store.history.push("/playlist/" + newPlaylist1._id);

        }
        }
        asyncCreateNewList(); //cretas newlist
        
    }
    //shreyas edits for set list name

    //----------shreyas set list name ------------
    //shreyas edits




    //tryin to add song shreyas 

    store.addSongTransactionHandler = function(index1){
        let transaction= new AddSong_Transaction(store,index1); //store,index maybe
        console.log('Shreyas inside the add song transaction handler within store index.js, sent here from add song transaction, in transactions.')
        tps.addTransaction(transaction);

    }
    //now need to add store.addSong
    
    store.addSong =function(index1,song1){
        let song = {
            title: "Untitled",
            artist: "Unknown",
            youTubeId: "dQw4w9WgXcQ"
        }
        //it appears my song1 is brutally crashing my code and breaking my nodemon, so i will make the song object here
        store.currentList.songs.push(song);
        store.updateMyPlaylist();

    }
     
    store.updateMyPlaylist = function(){
        
        async function updateMyPlaylist(){
            console.log("inside shreyas updatemyplaylist");
            let response = await api.updatePlaylistById(store.currentList._id, store.currentList)
            console.log("test before response data success check");
            if (response.data.success){
                console.log("seeing if response.data.success");
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST, payload: store.currentList
                })
            }
            console.log("seeing if update my playlist works after store reducer")
        }
        updateMyPlaylist();
    }

   

    //


    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getPlaylistPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: playlist
                    });
                    store.history.push("/playlist/" + playlist._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setListNameActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}