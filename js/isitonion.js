/*
 * Provide functionality for
 * topical guessing game.
 *
 * API Calls in a game-loop
 * update a model, which is
 * driven by interface interaction.
 *
 * @name    isitonion
 * @author  mod_ave
 * @version 0.2
 */

/* Global blueprints. */

// Store the current article as a truncated object.
var currentArticle = {
    title: null,
    from: null,
    link: null,
    image : null
};

// Store zeroed player information.
var user = {
    correct: 0,
    incorrect: 0,
    streak : 0
}

// 

/* Useful web-specific constants. */

var lock = false;

const HOST_URL = "https://www.reddit.com/r/";

const R = {
    THE_ONION: 'theonion',
    NOT_THE_ONION: 'nottheonion'
}

const badWords = [
    "quiz:",
    "?",
    "photos of",
    "tips for"
]

$(document).ready(() => {
   
    // Initialise user profile from cookies if they exist.
    if(Cookies.get('correct') != null) {
        user.correct = Cookies.get('correct');
    };
    if(Cookies.get('incorrect') != null) {
        user.incorrect = Cookies.get('correct');
    };
    if(Cookies.get('streak') != null) {
        user.streak = Cookies.get('streak');
    };
    
    displayUserStreak();
    displayUserPercentCorrect();
    
});

/* MODEL */

/**
 *  Iterate upon the game loop.
 */
function iterate() {
    
    /* Initiate sequence. */
    getRandomArticle();
    
    /**
     *  Perform call to endpoint provided
     *  by 'Reddit' to fetch article content.
     */
    function getRandomArticle() {
        
        // Initially randomly decide on article type.
        var decision = (Math.random() > 0.5) ? R.THE_ONION : R.NOT_THE_ONION;
    
        // Make API request with contextual options.
        $.ajax(
            {
                type: 'GET',
                url: HOST_URL + decision + "/random.json",
                success: function(result) { decodeArticle(result) },
                error: function() { console.log("Error: Request could not be made.") },
                timeout: 30000, // No need for any more than a minute.
                dataType: 'json' // In case of funky redirects.
                
            });
        
    }
    
    /**
     *  Convert response into useful object.
     *
     *  @param response The response from the endpoint as JSON.
     */
    function decodeArticle(response) {
        
        // Ensure a response was found.
        if (response != null && response != undefined) {
            
            // Get the title of the retrieved article.
            currentArticle.title = response[0].data.children[0].data.title || null;
            
            /* Perform QA to reject certain articles. */
            
            // Ensure title is suitable.
            for(var word in badWords) {
                
                if(currentArticle.title.toLowerCase().indexOf(word.toLowerCase()) > -1) {
                    
                    console.log("Warning: That article didn't look right - skipping it.");
                    
                    // Skip!
                    iterate();
                    return;
                    
                }
                
            }
            
            // Reject meta articles.
            if(response[0].data.children[0].kind.indexOf('self.' + R.THE_ONION) > -1 
               || response[0].data.children[0].kind.indexOf('self.' + R.NOT_THE_ONION) > -1) {
                
                // Skip!
                iterate();
                return;
                
            }
            
            // Get the subreddit of the retrieved article.
            currentArticle.from = response[0].data.children[0].data.subreddit.toLowerCase() || null;
            
            // Get the link of the retrieved article.
            currentArticle.link = response[0].data.children[0].data.url;
            
            // Ensure the response was valid to some extent.
            if(currentArticle.from == null || currentArticle.title == null) {
                console.log("Error: Response missing elements.");
            }
            else {
                displayNextArticle();
            }

        }
        else {
            console.log("Error: Response state invalid.");
        }
        
    }
    
}

/**
 *  Mark the user's answer.
 *
 *  @param userAnswer The user's answer
 *                    as a member of the
 *                    indexing object R.
 */
function answer(userAnswer) {
    
    if(lock) {
        return;
    }
    lock = true;
    
    // Store easy branch.
    var correct = (userAnswer == currentArticle.from);
    
    if(correct) {
        
        // Log the result in the RTDB.
        database.ref('meta/totalcorrect').transaction(function(total) {
            if(total != null) {
                return total+1;
            }
        });
        
        user.correct++;
        
        // Update this user value.
        Cookies.set('correct', user.correct, { expires: 7 });
        
        // Increment the user's correct streak.
        user.streak++;
        
    }
    else {
        
        // Log the result in the RTDB.
        database.ref('meta/totalincorrect').transaction(function(total) {
            if(total != null) {
                return total+1;
            }
        });
        
        user.incorrect++;
        
        // Update this user value.
        Cookies.set('incorrect', user.incorrect, { expires: 7 });
        
        // Erase the user's correct streak.
        user.streak = 0;
        
    }
    
    // Update user streak.
    Cookies.set('streak', user.streak, { expires: 7 });
    
    displayUserPercentCorrect();
    
    displayUserStreak();

    displayResult(correct);
    
}

/* VIEW */

/**
 *  Update the display to reflect the new article.
 */
function displayNextArticle() {

    // Update the toast.
    $('#toast').text('BREAKING NEWS:');
    
    // Update the title.
    $('#article-title').text(currentArticle.title);
    
    lock = false;

}

/**
 * Provide visual cues to the user to indicate
 * the state of their streak of correct answers.
 */
function displayUserStreak() {
    
    $('#user-streak').text(user.streak);
    
}

function displayUserPercentCorrect() {
    if(user.correct == 0) {
        $('#user-percent').text('0%');
    }
    else {
       $('#user-percent').text(Math.round((user.correct / (user.correct + user.incorrect) * 100)) + '%'); 
    }
}

function displayResult(correct) {
    
    if(currentArticle.link != null) {
        if(correct) {
            $('#article-title').html(
                '<a href="' + currentArticle.link + '" target="_new">Correct!</a>'
            );
        }
        else {
            $('#article-title').html(
                'Incorrect  <span><a href="' + currentArticle.link + '" target="_new">Don\'t believe it? Check it out.</span></a>'
            );
        }
    }
    else {
        if(correct) {
            $('#article-title').html('Correct!');
        }
        else {
            $('#article-title').html('Incorrect');
        }
    }
    
    setTimeout(function() {
        $('#toast').text('3');
        setTimeout(function() {
            $('#toast').text('2');
                setTimeout(function() {
                    $('#toast').text('1');
                    setTimeout(function() {
                        iterate();
                    }, 1000);
                }, 1000);
        }, 1000);
    }, 1000);
    
}
