const WEBHOOK = "<YOURWEBHOOK>";

const MAX_LENGTH = 1900;
const FILENAME =
    'GreekPinned_InfiniteCraft.json';
	
const delay = ms => new Promise(res => setTimeout(res, ms));

class Logger {
    constructor(webhook) {
        this.webhook = webhook;
        this.buffer = [];
        this.length = 0;
    }

    log(message) {
        this.buffer.push(message);
        this.length += message.length + 1;
        if (this.length > MAX_LENGTH) {
            const itemsToSend = this.buffer.slice(0, this.buffer.length - 1);
            this.buffer = [this.buffer[this.buffer.length - 1]];
            this.length = this.buffer[0].length;
            try {
                this.send(itemsToSend);
            } catch (error) {
                throw error;
            }
        }
    }

    sendBuffer() {
        if (this.length > 0) {
            const itemsToSend = this.buffer;
            console.log('Buffer to sent.');
            this.send(itemsToSend);
            console.log('Buffer sent.');
        }
    }

    async send(items) {
        const content = `\`\`\`\n${items.join('\n')}\n\`\`\``;
        let tries = 5;
        while (tries) {
            try {
                await fetch(this.webhook, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content,
                        embeds: null,
                        attachments: []
                    }),
                    method: 'POST',
                });

                return;
            } catch (error) {
                throw error;
            }
        }
    }
}

const logger = new Logger(WEBHOOK_IRAKLEITOS);

const DEFAULT_ITEMS = [
    {text: 'Νερό', emoji: '💦', discovered: false},
  {text: 'Πυρ', emoji: '🔥', discovered: false},
  {text: 'Φωτιά', emoji: '🔥', discovered: false},
  {text: 'Άνεμος', emoji: '💨', discovered: false},
  {text: 'Αέρας', emoji: '💨', discovered: false},
  {text: 'Αηρ', emoji: '✈️', discovered: false},
  {text: 'Γη', emoji: '🌍', discovered: false},
  {text: 'Γαία', emoji: '🌍', discovered: false}
];


//localStorage.setItem('infinite-craft-data', JSON.stringify({elements : DEFAULT_ITEMS }));


async function resetCrafts() {
    recipes = {};
    localStorage.setItem('recipes', '{}');
}

async function initRecipes(elements) {
    recipes = JSON.parse((localStorage.getItem('recipes')) ?? '{}');
    delete recipes['Nothing'];
    for (const recipeKey of Object.keys(recipes)) {
        for (let i = recipes[recipeKey].length - 1; i >= 0; i--) {
            if (recipes[recipeKey][i] === undefined ||
                recipes[recipeKey][i] === null ||
                recipes[recipeKey][i].length < 2 ||
                recipes[recipeKey][i][0].text === recipeKey ||
                recipes[recipeKey][i][1].text === recipeKey) {
                recipes[recipeKey].splice(i, 1);
            }
        }
    }
    localStorage.setItem('recipes', JSON.stringify(recipes));
}
async function addElementToCrafts(first, second, result, loading = false) {
    if (!loading) {
        let recipes = JSON.parse(localStorage.getItem('recipes'));
    }
    const ingredients = [first, second].sort((a, b) => {
        return a.text.localeCompare(b.text);
    });
    if (recipes[result] === undefined)
        recipes[result] = [];
    if (recipes[result].find((recipe) => recipe[0].text === ingredients[0].text && recipe[1].text === ingredients[1].text) !== undefined)
        return;
    recipes[result].push([{
                text: ingredients[0].text,
                emoji: ingredients[0].emoji ?? '⬜',
            }, {
                text: ingredients[1].text,
                emoji: ingredients[1].emoji ?? '⬜',
            },
        ]);
    if (!loading)
        localStorage.setItem('recipes', JSON.stringify(recipes));
}

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function combine(a, b) {

    const aText = a.text;
    const bText = b.text;

    const url = new URL('/api/infinite-craft/pair', location.href);
    const searchParams = new URLSearchParams();
    searchParams.append('first', aText);
    searchParams.append('second', bText);
    url.search = searchParams.toString();
    try {
        const response = await fetch(url, {
            "headers": {
                "accept": "*/*",
            },
            "referrer": "https://neal.fun/infinite-craft/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });
        if (response.ok) {
            const result = await response.json();

            return result;
        } else {
            console.log(`Error with neal.fun combining: ${aText} + ${bText}`);
        }
    } catch (error) {
        const result = {
            "result": "Nothing",
            "emoji": "",
            "isNew": false

        };
        console.log(error);
        throw (error);
    }
}

async function spellcheck(word) {

    // Add a text field
    //const word =  element.text;
    //console.log(`"${word}". Word to be send for spell check`);

    // Construct a FormData instance
    var formData = [];
    //var encodedKey = encodeURIComponent(`${word}`);
    //console.log(`After URI encoding becomes: "${encodedKey}"`);
    var encodedValue = encodeURIComponent('');
    formData.push(word + "=" + encodedValue);

    //try {
    const url = new URL('https://www.neurolingo.gr/api/speller', location.href);
    const searchParams = new URLSearchParams();
    searchParams.append('lang', 'en');
    url.search = searchParams.toString();

    const response = await fetch(url, {
        "headers": {
            "accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "referrer": "https://www.neurolingo.gr/en/online_tools/speller",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": formData,
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });

    const result = await response.json();
    return result;
    // } catch (error) {
    // const result = {"ts":0,"errors":[{"o":0,"l":0,"s":[""]}]};
    //return result;
    //}
}

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}

await function resetPinned() {
    let pinnedElements = [];
const  items = JSON.parse(localStorage.getItem('infinite-craft-data'))?.elements ?? DEFAULT_ITEMS;
	let itemSet = new Set(items.map(item => item.text));
     
	for (element of items) {
        if (hasWhiteSpace(element.text)) continue;
		notGreek = false;
		 for (let i = 0; i < element.text.length; i++) {
		if (element.text[i].charCodeAt(0) < 900) {
			notGreek = true;
			break;
			}
		}
		if (notGreek) continue;
            let checkedItem = await spellcheck(element.text);
            let isNotValidWord = (checkedItem.errors.length > 0);
            if (isNotValidWord){
				console.log(`Word ${element.text} is NOT valid Greek/English!`);
				continue;
			}
			console.log(`Word ${element.text} is valid Greek/English!`);
        pinnedElements.push({
            text: element.text,
            discovered: element.discovered,
            emoji: element.emoji,
        });

    }
    localStorage.setItem('pinned', JSON.stringify(pinnedElements));
}

async function updatePinned() {
    const items = JSON.parse(localStorage.getItem('infinite-craft-data'))?.elements ?? DEFAULT_ITEMS;
     let pinnedElements = JSON.parse(localStorage.getItem('pinned')) ?? DEFAULT_ITEMS;
	let pinnedSet = new Set(pinnedElements.map(item => item.text));
	let itemSet = new Set(items.map(item => item.text));
	for (element of items) {
		if (hasWhiteSpace(element.text)) continue;
		if (!pinnedSet.has(element.text)){
		if (!itemSet.has(element.text)){
		notGreek = false;
		 for (let i = 0; i < element.text.length; i++) {
		if (element.text[i].charCodeAt(0) < 900) {
			notGreek = true;
			break;
			}
		}
		}else{
			notGreek = true;
		}
		if (notGreek) continue;
            let checkedItem = await spellcheck(element.text);
            let isNotValidWord = (checkedItem.errors.length > 0);
            if (isNotValidWord){
//console.log(`Word ${element.text} is NOT valid Greek/English!`);
				continue;
			}
			//console.log(`Word ${element.text} is valid Greek/English!`);
        pinnedElements.push({
            text: element.text,
            emoji: element.emoji,
			discovered: element.discovered,
        });

		}
	}
    localStorage.setItem('pinned', JSON.stringify(pinnedElements));
}

async function saveJSON() {
    const saveFile = JSON.parse(localStorage.getItem('infinite-craft-data'));
    const pinnedElements = JSON.parse((localStorage.getItem('pinned')) ?? '[]');
    saveFile.pinned = pinnedElements;
    recipes = JSON.parse(localStorage.getItem('recipes'));
    saveFile.recipes = recipes;
    const downloadLink = document.createElement('a');
    downloadLink.download = FILENAME;
    downloadLink.href = URL.createObjectURL(new Blob([JSON.stringify(saveFile, null, '\t')], {
                type: 'application/json',
            }));
    downloadLink.dataset.downloadurl = ['application/json', downloadLink.download, downloadLink.href].join(':');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(function () {
        URL.revokeObjectURL(downloadLink.href);
    }, 1500);
}

async function main() {
    resetCrafts();
	resetPinned();
    updatePinned();
    let pinned = JSON.parse((localStorage.getItem('pinned'))) ?? DEFAULT_ITEMS;
    let items = JSON.parse(localStorage.getItem('infinite-craft-data'))?.elements ?? DEFAULT_ITEMS;
    let itemSet = new Set(items.map(item => item.text));
    let addToDatabase = 0;
    //i = 0;
    while (true) {
        //while (i < 3) {
        const b = randomItem(pinned);
        const a = randomItem(pinned);
        try {
            const combination = await combine(a, b);
            if (combination.result !== 'Nothing') {
                if (!itemSet.has(combination.result)) {
                    const words = combination.result.split(" ");
                    for (const word of words) {
                        //console.log(word);
                        if (word.length < 2) {
                            const codePoint = word.codePointAt(0).toString(16);
							console.log(`Character ${word} is Codepoint U+${codePoint}.`);
							await delay(60);
                                console.log("Waited 60ms");
								try{
								logger.log(`Character ${word} is Codepoint U+${codePoint}.`);
								}catch(error){ 
								console.log('Message sending failed.');
                                    console.log(error);
								}
                        }
                        if (!itemSet.has(word)) {
                            let checkedItem = await spellcheck(word);
                            let isNotGreek = (checkedItem.errors.length > 0);
                            if (isNotGreek) {
									console.log(`Word ${word} is NOT valid Greek/English!`);
                                //let suggestions = checkedItem.errors[0].s.join('" ή "');
                                //console.log(`Μήπως ενννοείς "${suggestions}" ;`);
                            } else {
                                console.log(`Word ${word} is valid Greek/English!`);
                                await delay(60);
                                console.log("Waited 60ms");
                                try {
                                    logger.log(`${a.emoji ?? "□"} ${a.text} + ${b.emoji ?? "□"} ${b.text} = ${combination.emoji ?? "□"} ${combination.result}${combination.isNew ? ". It's a new discovery!" : ""}`);
                                } catch (error) {
                                    console.log('Message sending failed.');
                                    console.log(error);
                                }
                            }
                        }
                    }

                    itemSet.add(combination.result);

                    items.push({
                        text: combination.result,
                        emoji: combination.emoji ?? "□",
                        discovered: combination.isNew,
                    });

                    const newStorageItem = JSON.stringify({
                        elements: items
                    });
                    localStorage.setItem('infinite-craft-data', newStorageItem);
                    updatePinned();
					
					                await saveJSON();

                items = JSON.parse(localStorage.getItem('infinite-craft-data'))?.elements ?? DEFAULT_ITEMS;
                pinned = JSON.parse((localStorage.getItem('pinned'))) ?? DEFAULT_ITEMS;
                }
				if (combination.result !== a.text) {
					if (combination.result !== b.text) {
				
                addElementToCrafts(a, b, combination.result);

                console.log(`${a.emoji ?? "□"} ${a.text} + ${b.emoji ?? "□"} ${b.text} = ${combination.emoji ?? "□"} ${combination.result}${combination.isNew ? ". It's a new discovery!" : ""}`);
								let isNotGreek = false;
				const words = combination.result.split(" ");
                    for (const word of words) {
				let checkedItem = await spellcheck(word);
                            let isNotGreek = (checkedItem.errors.length > 0);
                            if (isNotGreek) break;
					}
					if (!isNotGreek){
					await delay(60);
                                console.log("Waited 60ms");
                                try {
                                    logger.log(`${a.emoji ?? "□"} ${a.text} + ${b.emoji ?? "□"} ${b.text} = ${combination.emoji ?? "□"} ${combination.result}${combination.isNew ? ". It's a new discovery!" : ""}`);
                                } catch (error) {
                                    console.log('Message sending failed.');
                                    console.log(error);
                                }
					}

                await saveJSON();
            }else{
				var foundIndex = items.findIndex(x => x.text == combination.result);
				if (items[foundIndex].emoji !== "□"){}else{
				items[foundIndex].emoji = combination.emoji;
				}
			}
				}else{
				var foundIndex = items.findIndex(x => x.text == combination.result);
				if (items[foundIndex].emoji !== "□"){}else{
				items[foundIndex].emoji = combination.emoji;
				}
			}
			}
            await new Promise(resolve => setTimeout(resolve, 500));

            //i++;

        } catch (error) {

            console.log('Exiting loop.');
            console.log(error)
            break;

        }
    }
    logger.sendBuffer();

}

main();
