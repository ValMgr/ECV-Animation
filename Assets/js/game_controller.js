class Knight {

    static DIRECTORY = 'Assets/img';
    static P_SLUG = 'knight1/Knight_03';
    static E_SLUG = 'knight2/Knight_01';
    static ANIM_FRAMES = 10; // Frames number for each animation

    constructor(element, isPlayer = false){
        this.element = element;
        this.isPlayer = isPlayer;
        this.hp = 3;
        this.slug = isPlayer ? Knight.P_SLUG : Knight.E_SLUG;
        this.img = element.querySelector('.sprite');
        this.anim = this.idleAnim();
    }

    idleAnim(){
        const ACTION = 'IDLE';
        let i = 0;
        
        return setInterval(() => {
            i = this.nextIterator(i, Knight.ANIM_FRAMES);
            this.img.setAttribute('src', `${Knight.DIRECTORY}/${this.slug}__${ACTION}_00${i}.png`);
        }, 100);
    }

    otherAnim(ACTION, iddle = false){ // ACTION => ATTACK, HURT, JUMP, DIE
        clearInterval(this.anim);
        this.anim = null;
        for(let i = 0; i < Knight.ANIM_FRAMES; i++){
            setTimeout(() => {this.img.setAttribute('src', `${Knight.DIRECTORY}/${this.slug}__${ACTION}_00${i}.png`)}, 100*i);
        }
        if(ACTION !== 'DIE') setTimeout(() => {this.img.setAttribute('src', `${Knight.DIRECTORY}/${this.slug}__IDLE_000.png`)}, 1000); // reset inital position 
        if(iddle) setTimeout(() => this.anim = this.idleAnim(), 1100);
    }

    attack(target){
        const r = Math.floor(Math.random() * 3);
        r ? target.takeDamage(1) : this.broadcast('Miss', '#FFFFFF');
        clearInterval(this.anim);
        this.otherAnim('ATTACK', true);
    }

    heal(){
        this.hp < 3 ? this.gainHP(1) : this.broadcast('Full life', '#0000FF');
    }

    broadcast(text, color = '#FFFFFF'){
        const broadcastEl = document.createElement('p');
        broadcastEl.classList.add('broadcast')
        broadcastEl.innerText = text;
        broadcastEl.style.color = color;
        this.element.append(broadcastEl);
        broadcastEl.animate([{transform: 'translateY(-100px)'}],{duration: 1000, fill: 'forwards', easing: 'ease-in'});
        setTimeout(() => broadcastEl.remove(), 1000);
    }

    gainHP(hp){
        this.hp += hp;
        this.broadcast('+'+hp, '#00FF00');
        this.otherAnim('JUMP', true);
        this.addHeart();
    }

    takeDamage(damage){
        this.hp -= damage;
        this.broadcast('-'+damage, '#FF0000');
        this.otherAnim('HURT', true);
        this.removeHeart();
    }

    getHP(){
        return this.hp;
    }

    die(){
        this.otherAnim('DIE', false);
    }

    addHeart(){
        const heart = this.element.children[0].children[this.hp-1];
        heart.classList.remove('hidden');
    }

    removeHeart(){
        const heart = this.element.children[0].children[this.hp];
        heart.classList.add('hidden');
    }

    nextIterator(i, l){
        if(i < l - 1){
            return i + 1;
        }
        else{
            return 0;
        }
    }

}

function gameManager(pEl, eEl, callback){

    function initPlayerInputListener(){
        document.querySelector('#attack-btn').addEventListener('click', attack);
        document.querySelector('#heal-btn').addEventListener('click', heal);
    }

    function removePlayerListener(){
        document.querySelector('#attack-btn').removeEventListener('click', attack);
        document.querySelector('#heal-btn').removeEventListener('click', heal);
    }

    initPlayerInputListener();
    const player = new Knight(pEl, true);
    const enemy = new Knight(eEl, false);
    let iaPlaying = false;

    
    function attack(){
        if(!iaPlaying) nextTurn(true);
    }

    function heal(){
        if(!iaPlaying) nextTurn(false)
    }

    function nextTurn(action){ // true = attack - false = heal
        action ? player.attack(enemy) : player.heal();
        console.log(`%cPlayer turn %c- Player : ${player.getHP()}  Enemy : ${enemy.getHP()}`, 'color: blue', 'color: white');
        if(!checkEnd()) iaTurn();
    }

    function iaTurn(){
        iaPlaying = true
        const rdmTime = Math.floor(Math.random() * 1000);
        setTimeout(() => {
            const r = Math.floor(Math.random() * 3);
            r ? enemy.attack(player) : enemy.heal();
            console.log(`%cIA turn %c- Player : ${player.getHP()}  Enemy : ${enemy.getHP()}`, 'color: red', 'color: white');
            checkEnd();
            iaPlaying = false;
        }, 1200 + rdmTime);
    }

    function checkEnd(){
        if(!player.getHP() || !enemy.getHP()){
            removePlayerListener();
            setTimeout(() => {
                if(player.getHP()){
                    enemy.otherAnim('DIE');
                    callback(true);
                }
                else{
                    player.otherAnim('DIE');
                    callback(false);
                }
            }, 1100);
            return true;
        }
        else{
            return false;
        }
    }


}


