const WEBHOOK = '<YOURWEBHOOK>';

const MAX_LENGTH = 1900;

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
      
      this.send(itemsToSend);
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
          body: JSON.stringify({ content, embeds: null, attachments: [] }),
          method: 'POST',
        });
        
        return;
      } catch (error) {
        tries -= 1;
      }
    }
  }
}

const logger = new Logger(WEBHOOK);

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
	    const ingredients = [first, second].sort((a, b) => {
	        return a.text.localeCompare(b.text);
	    });
	    if (recipes[result] === undefined)
	        recipes[result] = [];
	    if (recipes[result].find((recipe) => recipe[0].text === ingredients[0].text && recipe[1].text === ingredients[1].text) !== undefined)
	        return;
	    recipes[result].push([
	        {
	            text: ingredients[0].text,
	            emoji: ingredients[0].emoji ?? '⬜',
	        },
	        {
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
	      try {
  const aText = a.text;
  const bText = b.text;
  
  const url = new URL('/api/infinite-craft/pair', location.href);
  const searchParams = new URLSearchParams();
  searchParams.append('first', aText);
  searchParams.append('second', bText);
  url.search = searchParams.toString();
  
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
  
  const result = await response.json();
  return result;
    } catch (error) {
	  const result = {"result":"Nothing","emoji":"","isNew":false};
	  return result;
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

	async function resetPinned() {
	    pinned = [];
		localStorage.setItem('pinned', '[]');
	}
	
	async function updatePinned() {
		resetPinned();
	    let pinnedElements = [];
	    const data = JSON.parse(localStorage.getItem('infinite-craft-data'));
	    for (element of data.elements) {
	        if (element.text.length < 2) {
							const codePoint = element.text.codePointAt(0).toString(16); 
			console.log(`Codepoint U+${codePoint} is letter ${element.text}`);
			}
			//console.log(element.text);
	        //const str = element.text;

	        // Output array
	        //const codePoints = [];

	        // Loop over each character in the string
	        //for (const char of str) {
	            // Get the code point value of the character
	          //  const codePoint = char.codePointAt(0);
	            // Push the code point value to the output array
	            //codePoints.push(codePoint);
	        //}

	        // Log the output array
	        //console.log(codePoints);
	        //console.log(element.text.length);
	        
			if (hasWhiteSpace(element.text)) continue;
			
	            pinnedElements.push({
	                text: element.text,
	                discovered: element.discovered,
	                emoji: element.emoji ?? '⬜',
	            });
	        
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
	        downloadLink.download = 'GreekCraft_Pinned.json';
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
	let recipes = {};
	resetCrafts();
	updatePinned();
	recipes = JSON.parse((localStorage.getItem('recipes')) ?? '{}');
	let pinned = JSON.parse((localStorage.getItem('pinned'))) ?? DEFAULT_ITEMS;
	let items = JSON.parse(localStorage.getItem('infinite-craft-data'))?.elements ?? DEFAULT_ITEMS;
	let itemSet = new Set(items.map(item => item.text));
	let spells = [];
	let spellSet = new Set(spells.map(spell => spell.result));
	let addToDatabase = 0;
  //i = 0;
  while ( true ) {
	  //while (i < 3) {
    const b = randomItem(pinned);
    const a = randomItem(pinned);
    
    const combination = await combine(a, b);
    if (combination.result !== 'Nothing') {
      if (!itemSet.has(combination.result)) {
		  const words = combination.result.split(" ");
	  addToDatabase = 0;
	  for (const word of words){
		  //console.log(word);
		  
		  let checkedItem = await spellcheck(word);
			  let isNotGreek = (checkedItem.errors.length > 0);
			  if (isNotGreek) {
				  addToDatabase++;
				  console.log(`Word ${word} is NOT valid Greek/English!`);
		  //let suggestions = checkedItem.errors[0].s.join('" ή "');
		  //console.log(`Μήπως ενννοείς "${suggestions}" ;`);
			  } else if (!itemSet.has(word)) {
			  addToDatabase = -1;
			  console.log(`Word ${word} is valid Greek/English!`);
			  break;
		  }
		  //addToDatabase--;
		   //break;
		   //console.log(`Word ${word}${isNotGreek ? " is not valid Greek/English!" : " is valid Greek/English!"}`);
	  }
	  
	  }
	  
	  if (addToDatabase < 1) {
		

        itemSet.add(combination.result);
        
        items.push({
          text: combination.result,
          emoji: combination.emoji,
          discovered: combination.isNew,
        });
	  }
		
        addElementToCrafts(a, b, combination.result);
		if (!spellSet.has(combination.result)) {
		

        //const newStorageItem = JSON.stringify({ elements: items, recipes: {}});
        //localStorage.setItem('infinite-craft-data', newStorageItem);
		//newStorageItem.recipes = recipes;
		const newStorageItem = JSON.stringify({ elements: items});
		localStorage.setItem('infinite-craft-data', newStorageItem);
		logger.log(`${a.emoji ?? "□"} ${a.text} + ${b.emoji ?? "□"} ${b.text} = ${combination.emoji ?? "□"} ${combination.result}${combination.isNew ? ". It's a new discovery!" : ""}`);
		console.log(`${a.emoji ?? "□"} ${a.text} + ${b.emoji ?? "□"} ${b.text} = ${combination.emoji ?? "□"} ${combination.result}${combination.isNew ? ". It's a new discovery!" : ""}`);
		
		updatePinned();
		await saveJSON();

      }
	}
    
    await new Promise(resolve => setTimeout(resolve, 500));
	
	items = JSON.parse(localStorage.getItem('infinite-craft-data'))?.elements ?? DEFAULT_ITEMS;
	recipes = JSON.parse((localStorage.getItem('recipes')) ?? '{}');
	pinned = JSON.parse((localStorage.getItem('pinned'))) ?? DEFAULT_ITEMS;
  	
	//i++;
  }

}

main();
