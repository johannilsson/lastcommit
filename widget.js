/**
 * Widget that shows the last commit made in a users github repositories.
 *
 * Based on the avvikelse widget by Erik Pettersson (@ptz0n)
 * http://dev.av.vikel.se
 *
 * By Johan Nilsson (http://markupartist.com)
 */
(function() {

    // Localize jQuery variable
    var jQuery;
    var remoteJquery = 'http://code.jquery.com/jquery-1.7.min.js';
    var localJquery = 'http://johannilsson.com/lastcommit/jquery-1.7.min.js';

    /**
     * Load jQuery if not present
     */
    if (window.jQuery === undefined || window.jQuery.fn.jquery >= '1.6.4') {
        appendJqueryScriptTag(remoteJquery, localJquery);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        init();
    }

    /**
     * Init widgets
     */
    function init() {
        jQuery(document).ready(function($) {
            var selector = '.lastcommit-widget';

            $.each($(selector), function(i, e) {
                var element = $(this);
                var user = element.attr('data-user');
                getLastCommit(user, function(repository, commit) {
                    renderWidget(element, {
                        user: user,
                        repository: repository,
                        commit: commit
                    });
                });
            });

            // Style
            var cssLink = $('<link>', {
                rel: 'stylesheet',
                type: 'text/css',
                href: 'http://johannilsson.com/lastcommit/widget.css'
            });
            cssLink.appendTo('head');

            /**
             * Finds the last commit for the user.
             *
             * @param user The user
             * @param callback A function to call when commit has been
             * retrieved will be called with repository and commit.
             */
            function getLastCommit(user, callback) {
                $.ajax({
                    url: 'https://api.github.com/users/' + user + '/repos',
                    dataType: 'jsonp',
                    data: {},
                    success: function(data) {
                        repositories = data.data;
                        repositories.sort(function(a, b) {
                            return Date.parse(a.pushed_at) - Date.parse(b.pushed_at);
                        });
                        var repository = repositories[repositories.length - 1];
                        $.ajax({
                            url: 'https://api.github.com/repos/' + user + '/' + repository.name + '/commits',
                            dataType: 'jsonp',
                            data: {},
                            success: function(data) {
                                // TODO: Verify author.
                                var lastCommit = data.data.shift();
                                callback(repository,lastCommit);
                            }
                        });
                    }
                });
            }

            /**
             * Render widget.
             *
             * @param element The element to render the widget to.
             * @param data Data to populate the widget with.
             */
            function renderWidget(element, data) {
                url = 'https://github.com/' + data.user + '/' + data.repository.name +'/commit/' + data.commit.sha
                var html = '<a href="' + url +'"> ' + data.commit.commit.message + '</a>';
                element.html('<span class="lastcommit">' + html + '</span>');
            }
        });
    }

    /**
     * Append jQuery script tag
     *
     * @param url
     * @param fallbackUrl
     */
    function appendJqueryScriptTag(url, fallbackUrl) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.setAttribute('src', url);
        scriptTag.onload = scriptLoadHandler;
        scriptTag.onreadystatechange = scriptReadyStateChangeHandler;

        if(fallbackUrl) {
            scriptTag.onerror = function()
            {
                appendJqueryScriptTag(fallbackUrl);
            };
        }

        (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(scriptTag);
    }

    /**
     * Script ready state change handler
     *
     * Same thing but for IE
     */
    function scriptReadyStateChangeHandler() {
        if(this.readyState == 'complete' || this.readyState == 'loaded') {
            scriptLoadHandler();
        }
    }

    /**
     * Script load handler
     *
     * Called once jQuery has loaded
     */
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);

        // Call widgets init function
        init();
    }

})();