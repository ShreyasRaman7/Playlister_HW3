import jsTPS_Transaction from "../common/jsTPS.js"

/**
 * CreateSong_Transaction
 * 
 * This class represents a transaction that creates a song
 * in the playlist. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class CreateSong_Transaction extends jsTPS_Transaction {
    constructor(initStore1, initIndex1) {
        super();
        this.store = initStore1;
        this.index = initIndex1;
        this.newSong = {
            title: 'Untitled',
            artist: 'Unknown',
            youTubeId: 'dQw4w9WgXcQ'
        };
    }

    doTransaction() {
        console.log("inside do transaction of add song");
        this.store.addSong(this.newSong, this.index);
    }
    
    undoTransaction() {
        console.log("inside undo transaction of add song");
        this.app.deleteSong(this.index);
        //set state with updated list
    }
}