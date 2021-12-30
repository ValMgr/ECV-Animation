"use-strict";

function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function _ScrollTo(x, y, callback = () => {}){
    document.body.style.overflowY = 'scroll';
    window.scrollTo({
        top: y,
        left: x,
        behavior: 'smooth'
    });
    const isScrolling = setInterval(() => {
        if(window.scrollY === y){
            document.body.style.overflowY = 'hidden';
            clearInterval(isScrolling);
            callback();
        }
    }, 15); //refresh rate
}

function scrollNextFrame(fn){
    const currentScroll = window.scrollY;
    const target = currentScroll + window.innerHeight;
    _ScrollTo(0, target, fn);
}


// knights Sprites animations
const DIRECTORY = 'Assets/img';
const P_SLUG = 'knight1/Knight_03';
const E_SLUG = 'knight2/Knight_01';
const ANIM_FRAMES = 10; // Frames number for each animation

function idleAnim(img, player){
    const ACTION = 'IDLE';
    const SLUG = player ? P_SLUG : E_SLUG;
    let i = 0;
    
    return setInterval(() => {
        i = nextIterator(i, ANIM_FRAMES);
        img.setAttribute('src', `${DIRECTORY}/${SLUG}__${ACTION}_00${i}.png`);
    }, 100);
}

function otherAnim(img, player, ACTION){ // ACTION => ATTACK, HURT, JUMP, DIE
    const SLUG = player ? P_SLUG : E_SLUG;    
    for(let i = 0; i < ANIM_FRAMES; i++){
        setTimeout(() => {img.setAttribute('src', `${DIRECTORY}/${SLUG}__${ACTION}_00${i}.png`)}, 100*i);
    }
    if(ACTION !== 'DIE') setTimeout(() => {img.setAttribute('src', `${DIRECTORY}/${SLUG}__IDLE_000.png`)}, 1000); // reset inital position 
}
// end knights sprites

// coin sprite
function createCoinObserver(){
    let animation = null;
    return new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
           if(entry.isIntersecting){
            animation = coinAnimation(entry.target);
           }
           else{
            clearInterval(animation);
           }
        });
    }, {threshold: 0.1});
}

function coinAnimation(coin){
    let i = 0;
    const frames = Array.from(coin.children);
    frames.forEach((f, i) => i ? f.classList.remove('v') : f.classList.add('v'));
    return setInterval(() => {
        frames[i].classList.remove('v');
        i = nextIterator(i, frames.length);
        frames[i].classList.add('v');
    }, 200);
}

function nextIterator(i, l){
    if(i < l - 1){
        return i + 1;
    }
    else{
        return 0;
    }
}
// end coin sprite

docReady(() => {

    initListener();
    // _ScrollTo(0, 0);

    const coins = document.querySelectorAll('.coin');
    const coinObserver = createCoinObserver();
    coins.forEach(c => coinObserver.observe(c));
    const player = document.querySelector('#player');
    const enemy = document.querySelector('#enemy');

    function initListener(){
        document.querySelector('#insertCoin').addEventListener('click', insertCoin);
        document.querySelector('#homeCoin').addEventListener('click', insertCoin);
        document.querySelector('#to-battle').addEventListener('click', toBattle);
        document.querySelector('#skip-btn').addEventListener('click', endBattle)
    }

    let STEP = 0;

    function insertCoin(){
        if(STEP === 0){
            document.querySelector('#homeCoin').removeEventListener('click', insertCoin);
            document.querySelector('#insertCoin').removeEventListener('click', insertCoin);
            const coin = document.querySelector('#homeCoin');
            coin.animate([{transform: 'translateY(90vh)'}], {duration: 2000, fill: 'forwards', easing: 'cubic-bezier(0.5, 0, 0.75, 0)'});
            setTimeout(() => {
                scrollNextFrame(showRules);
            }, 2100);
            STEP = 1;
        }
    }

    function showRules(){
        if(STEP === 1){
            setTimeout(() => {
                const title = document.querySelector('#rules');
                title.animate([{strokeDashoffset: 0}],{duration: 1500, fill: 'forwards', easing: 'ease-in'});
                setTimeout(() => {
                    const hiddenEl = document.querySelectorAll('section:nth-of-type(2) .o');
                    hiddenEl.forEach(e => e.classList.remove('o'));
                }, 1500);
            }, 500);
        }
    }

    function toBattle(){
        if(STEP === 1){
            scrollNextFrame(iddleFight);
            STEP = 2;
        }
    }

    function iddleFight(){
        const pImg = player.querySelector('.sprite');
        const eImg = enemy.querySelector('.sprite');
        let pAnim = idleAnim(pImg, true);
        let eAnim = idleAnim(eImg, false);
    }


    function endBattle(){
        scrollNextFrame(() => {
            const resultEl = document.querySelector('#result');
            const rdm = Math.floor(Math.random() * 2); // temp
            const result = rdm ? 'Winner' : 'Looser';
            resultEl.children[0].innerHTML = result;
            resultEl.animate([{strokeDashoffset: 0}],{duration: 1500, fill: 'forwards', easing: 'ease-in'});
        });
    }


});