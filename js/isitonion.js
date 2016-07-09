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
 * @version 0.1
 */

/* Global blueprints. */

// Store the current article as an object grouping.
var currentArticle = {
    title: null,
    from: null,
    link: null
};

// Store zeroed player information.
var user = {
    userAttempts: 0,
    userStreak : 0
}

/* Useful web-specific constants. */

const HOST_URL = "http://www.reddit.com/r/";

const R = {
    THE_ONION: 'theonion',
    NOT_THE_ONION: 'nottheonion'
}

const badWords = [
    "Quiz:"
]

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
                timeout: 60000, // No need for any more than a minute.
                cache: false, // Since results are random and quick, caching is wasteful.
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
            currentArticle.title = response[0].data.children[0].data.title;
            
            // Perform QA to reject certain articles.
            for(var word in badWords) {
                
                if(title.indexOf(word) > -1) {
                    
                    console.log("Warning: That article didn't look right - skipping it.");
                    
                    return;
                    
                }
                
            }
            
            // Get the subreddit of the retrieved article.
            currentArticle.from = response[0].data.children[0].data.subreddit;
            
            // Get the link of the retrieved article.
            currentArticle.link = response[0].data.children[0].data.link;
            
            // Ensure the response was valid to some extent.
            if(currentArticle.from == null || currentArticle.title == null) {
                console.log("Error: Response missing elements.");
            }
            else {
                displayArticle();
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
    
    // Increment the number of attempts made thus far.
    user.userAttempts++;
    
    console.log("User answer: " + userAnswer);
    
    // Success...
    if(userAnswer == currentArticle.from) {
        
        // Display that the user was correct.
        displayCorrect();
        
        // Increment the user's correct streak.
        user.userStreak++;
        
    }
    // Failure...
    else {
        
        displayIncorrect();
        
        // Erase the user's correct streak.
        user.userStreak = 0;
        
    }
    
    // Advance to the next article.
    iterate();
    
}

/* VIEW */

/**
 *  Update the display to reflect the new article.
 */
function displayArticle() {

    // Update the title.
    $('#article-title').text(currentArticle.title);

}

/**
 *  Provide visual cues to the user to indicate
 *  their correct choice.
 */
function displayCorrect() {
    
    $('#mark').text('Correct');
    
}

/**
 *  Provide visual cues to the user to indicate
 *  their incorrect choice.
 */
function displayIncorrect() {
    
    $('#mark').text('Incorrect');
    
}