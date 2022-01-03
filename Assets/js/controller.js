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

function createGroundObserver(){
    let anim = null;
    return new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                anim = rainbowGround();
            }
            else{
                clearInterval(anim);
            }
        });
    },{threshold: 0.1})
}

function rainbowGround(){
    const ground = document.querySelector('.ground');
    return setInterval(() => {
        const initalColor = getComputedStyle(ground).getPropertyValue('--groundShadow').match(/(\d+)/g);
        const nextColor = getColor(initalColor[0], initalColor[1], initalColor[2]);
        ground.style.setProperty('--groundShadow', nextColor);
    }, 500);
}

function getColor(r, g, b){
    const red = Math.floor(Math.random() * 255);
    const green = Math.floor(Math.random() * 255);
    const blue = Math.floor(Math.random() * 255);
    return `rgb(${red}, ${green}, ${blue})`;
}

function nextIterator(i, l){
    if(i < l - 1){
        return i + 1;
    }
    else{
        return 0;
    }
}

docReady(() => {

    initListener();
    _ScrollTo(0, 0);

    const coins = document.querySelectorAll('.coin');
    const coinObserver = createCoinObserver();
    coins.forEach(c => coinObserver.observe(c));
    const player = document.querySelector('#player');
    const enemy = document.querySelector('#enemy');
    const groundObserver = createGroundObserver();
    groundObserver.observe(document.querySelector('.ground'));

    function initListener(){
        document.querySelector('#insertCoin').addEventListener('click', insertCoin);
        document.querySelector('#homeCoin').addEventListener('click', insertCoin);
        document.querySelector('#to-battle').addEventListener('click', toBattle);
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
            scrollNextFrame(() => {
                gameManager(player, enemy, endBattle);
            });
            STEP = 2;
        }
    }

    function endBattle(isWin){
        if(STEP === 2){
            const resultEl = document.querySelector('#result');
            const result = isWin ? 'Winner' : 'Looser';
            resultEl.children[0].innerHTML = result;
            resultEl.animate([{strokeDashoffset: 0}],{duration: 1500, fill: 'forwards', easing: 'ease-in'});
            STEP = 3;
        }
    }

});