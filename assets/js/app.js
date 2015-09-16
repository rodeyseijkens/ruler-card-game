$(function ($) {


    var Country = Backbone.Model.extend({
        defaults: {
            "Country_Name": 0,
            "Political_Freedom": 0,
            "Media_Freedom": 0,
            "Human_Rights": 0,
            "Economic_Freedom": 0,
            "Satisfaction": 0,
            "Wealth": 0,
            "System_Stability": 0
        },
        initialize: function () {
        }
    });

    var CountryCollection = Backbone.Collection.extend({
        model: Country,
        url: './assets/js/data/countries.json',
        shuffleDeck: function () {
            this.models = _.shuffle(this.models);
        }
    });

    var Card = Backbone.Model.extend({
        defaults: {
            "Card_Name": 0,
            "Card_Type": 0,
            "Political_Freedom": 0,
            "Media_Freedom": 0,
            "Human_Rights": 0,
            "Economic_Freedom": 0,
            "Satisfaction": 0,
            "Wealth": 0,
            "System_Stability": 0,
            "Secondary": 0
        },
        initialize: function () {
        }
    });

    var CardDeckCollection = Backbone.Collection.extend({
        model: Card,
        url: './assets/js/data/cards.json',
        shuffleDeck: function () {
            this.models = _.shuffle(this.models);
        },
        drawCards: function (amount) {
            if (Math.floor(amount) != amount && $.isNumeric(amount)) {
                console.log("The amount of drawn cards isn't an interger", amount);
            }

            var drawnCards = _.first(this.models, amount); // Get The # of Cards from deck

            this.remove(drawnCards); // Remove Cards from Deck

            return drawnCards;
        }
    });

    var PlayerHandCollection = Backbone.Collection.extend({
        model: Card,
        limit: 5,
        addCardsToHand: function (models) {
            this.add(models);
        },
        removeCardsFromHand: function (model) {
            this.remove(model); // Remove Card from Hand Collection
        }
    });

    var PlayerHandView = Backbone.View.extend({
        id: 'player-hand',
        template: Handlebars.compile($("#player-hand-template").html()),
        round_counter: 0,
        events: {
            'click .card .button': 'playCard',
            'click #draw-card': 'drawCard'
        },
        initialize: function (options) {
            this.playerHandCollection = new PlayerHandCollection();

            this.setOptions(options);
            this.setListeners();

            this.firstCardSetup();
        },
        setOptions: function (options) {
            this.cardDeck = options.cardDeck;
            this.playerView = options.playerView;
        },
        setListeners: function () {
            this.listenTo(this.playerHandCollection, "update", this.render);
        },
        render: function () {
            this.$el.html(this.template(this.playerHandCollection.toJSON()));
            return this;
        },
        firstCardSetup: function () {
            var drawnCards = this.cardDeck.drawCards(this.playerHandCollection.limit); // Draw 5 cards
            this.playerHandCollection.addCardsToHand(drawnCards); // Add cards to hand
        },
        playCard: function (e) {
            var card_id = parseInt($(e.currentTarget).parent().attr('data-card-id')); // Make sure to parse it as an Int

            var card_model = this.playerHandCollection.findWhere({'Card_Id': card_id});

            // Apply Points
            this.playerView.applyPoints(card_model);

            // Remove it from hand
            this.playerHandCollection.removeCardsFromHand(card_model);

            this.playerView.round_counter++;

            $('#counter .inner').text(this.playerView.round_counter);

            if(this.playerView.round_counter > 30) {
                this.playerView.$el.addClass('fail');

                alert('You have been exiled!!!');
            }
        },
        drawCard: function (e) {
            if (this.playerHandCollection.length < this.playerHandCollection.limit) {
                var drawnCards = this.cardDeck.drawCards(1); // Draw 5 cards
                this.playerHandCollection.addCardsToHand(drawnCards); // Add cards to hand
            } else {
                alert("Hand Limit Reached.");
            }
        }
    });

    var PlayerView = Backbone.View.extend({
        id: 'player-stats',
        template: Handlebars.compile($("#player-stats-template").html()),
        round_counter: 0,
        initialize: function () {
            this.render();
        },
        setListeners: function () {
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        applyPoints: function (model) {

            if (model.get('Secondary')) {
                var dice = Math.floor(Math.random() * 6) + 1;

                alert('Dice Is Rolling...');

                if (dice > 3) {
                    alert('You rolled a: ' + dice + '. You will ' + model.get('Card_Name'));

                    this.model.set('Political_Freedom', this.model.get('Political_Freedom') + model.get('Political_Freedom'));
                    this.model.set('Media_Freedom', this.model.get('Media_Freedom') + model.get('Media_Freedom'));
                    this.model.set('Human_Rights', this.model.get('Human_Rights') + model.get('Human_Rights'));
                    this.model.set('Economic_Freedom', this.model.get('Economic_Freedom') + model.get('Economic_Freedom'));
                    this.model.set('Satisfaction', this.model.get('Satisfaction') + model.get('Satisfaction'));
                    this.model.set('Wealth', this.model.get('Wealth') + model.get('Wealth'));
                    this.model.set('System_Stability', this.model.get('System_Stability') + model.get('System_Stability'));
                } else {
                    alert(" You rolled a: " + dice + ". You won't " + model.get('Card_Name'));

                    this.model.set('Political_Freedom', this.model.get('Political_Freedom') + model.get('Secondary').Political_Freedom);
                    this.model.set('Media_Freedom', this.model.get('Media_Freedom') + model.get('Secondary').Media_Freedom);
                    this.model.set('Human_Rights', this.model.get('Human_Rights') + model.get('Secondary').Human_Rights);
                    this.model.set('Economic_Freedom', this.model.get('Economic_Freedom') + model.get('Secondary').Economic_Freedom);
                    this.model.set('Satisfaction', this.model.get('Satisfaction') + model.get('Secondary').Satisfaction);
                    this.model.set('Wealth', this.model.get('Wealth') + model.get('Secondary').Wealth);
                    this.model.set('System_Stability', this.model.get('System_Stability') + model.get('Secondary').System_Stability);
                }


            } else {
                this.model.set('Political_Freedom', this.model.get('Political_Freedom') + model.get('Political_Freedom'));
                this.model.set('Media_Freedom', this.model.get('Media_Freedom') + model.get('Media_Freedom'));
                this.model.set('Human_Rights', this.model.get('Human_Rights') + model.get('Human_Rights'));
                this.model.set('Economic_Freedom', this.model.get('Economic_Freedom') + model.get('Economic_Freedom'));
                this.model.set('Satisfaction', this.model.get('Satisfaction') + model.get('Satisfaction'));
                this.model.set('Wealth', this.model.get('Wealth') + model.get('Wealth'));
                this.model.set('System_Stability', this.model.get('System_Stability') + model.get('System_Stability'));
            }

            this.checkPoints();

            this.render();
        },
        checkPoints: function () {
            var count_above = 0;
            var system_stability_extra = 0;

            if (this.model.get('Political_Freedom') >= 9) {
                count_above++;

                if(this.model.get('Political_Freedom') > 10) {

                    var new_val = this.model.get('Political_Freedom') - 10;

                    this.model.set('Political_Freedom', 10);

                    system_stability_extra = system_stability_extra + new_val;
                }
            } else if(this.model.get('Political_Freedom') <= 0) {
                
                this.$el.addClass('fail');
            }

            if (this.model.get('Media_Freedom') >= 9) {
                count_above++;

                if(this.model.get('Media_Freedom') > 10) {

                    var new_val = this.model.get('Media_Freedom') - 10;

                    this.model.set('Media_Freedom', 10);

                    system_stability_extra = system_stability_extra + new_val;
                }
            } else if(this.model.get('Media_Freedom') <= 0) {
                
                this.$el.addClass('fail');
            }

            if (this.model.get('Human_Rights') >= 9) {
                count_above++;

                if(this.model.get('Human_Rights') > 10) {

                    var new_val = this.model.get('Human_Rights') - 10;

                    this.model.set('Human_Rights', 10);

                    system_stability_extra = system_stability_extra + new_val;
                }
            } else if(this.model.get('Human_Rights') <= 0) {
                
                this.$el.addClass('fail');
            }

            if (this.model.get('Economic_Freedom') >= 9) {
                count_above++;

                if(this.model.get('Economic_Freedom') > 10) {

                    var new_val = this.model.get('Economic_Freedom') - 10;

                    this.model.set('Economic_Freedom', 10);

                    system_stability_extra = system_stability_extra + new_val;
                }
            } else if(this.model.get('Economic_Freedom') <= 0) {
                
                this.$el.addClass('fail');
            }

            if (this.model.get('Satisfaction') >= 9) {
                count_above++;

                if(this.model.get('Satisfaction') > 10) {

                    var new_val = this.model.get('Satisfaction') - 10;

                    this.model.set('Satisfaction', 10);

                    system_stability_extra = system_stability_extra + new_val;
                }
            } else if(this.model.get('Satisfaction') <= 0) {
                
                this.$el.addClass('fail');
            }

            if (this.model.get('Wealth') >= 9) {
                count_above++;

                if(this.model.get('Wealth') > 10) {

                    var new_val = this.model.get('Wealth') - 10;

                    this.model.set('Wealth', 10);

                    system_stability_extra = system_stability_extra + new_val;
                }
            } else if(this.model.get('Wealth') <= 0) {
                this.$el.addClass('fail');
            }

            this.model.set('System_Stability', this.model.get('System_Stability') + system_stability_extra);

            if (this.model.get('System_Stability') > 10) {

                this.model.set('System_Stability', 10);
            } else if(this.model.get('System_Stability') <= 0) {
                this.$el.addClass('fail');
            }

            if(count_above >= 4) {
                this.$el.addClass('success');
            }
        }
    });


    var CardApp = Backbone.View.extend({
        el: '#card-app',
        loaded: 0,
        initialize: function () {
            var that = this;
            this.setListeners();

            this.cardDeckCollection = new CardDeckCollection();
            this.countryCollection = new CountryCollection();

            this.cardDeckCollection.fetch({
                success: function () {
                    that.trigger('CardCollectionFetched');
                },
                error: function () {
                    console.log('There was some error in loading and processing the JSON file', that.url);
                }
            });

            this.countryCollection.fetch({
                success: function () {
                    that.trigger('CountryCollectionFetched');
                },
                error: function () {
                    console.log('There was some error in loading and processing the JSON file', that.url);
                }
            });
        },
        setListeners: function () {
            var that = this;

            this.listenToOnce(this, "CardCollectionFetched", this.cardCollectionFetched);
            this.listenToOnce(this, "CountryCollectionFetched", this.countryCollectionFetched);
        },
        cardCollectionFetched: function () {
            if(this.loaded >= 1) {
                this.loadGame();
            } else {
                this.loaded++;
            }
        },
        countryCollectionFetched: function () {
            if(this.loaded >= 1) {
                this.loadGame();
            } else {
                this.loaded++;
            }
        },
        render: function () {
            this.$el.append(this.playerView.el); // Render Player Stats
            this.$el.append(this.playerHandView.el); // Render Player Stats

            return this;
        },
        loadGame: function() {
            this.cardDeckCollection.shuffleDeck();
            this.countryCollection.shuffleDeck();

            var player_country = this.countryCollection.models[0].clone(); // Get player Country

            this.playerView = new PlayerView({
                model: player_country
            });

            this.playerHandView = new PlayerHandView({
                model: player_country,
                cardDeck: this.cardDeckCollection,
                playerView: this.playerView
            });

            this.render();
        }
    });

    window.app = new CardApp();

});