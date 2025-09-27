const natural = require('natural');
const logger = require('../utils/logger');

class AIClassificationService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Keywords for category classification
    this.categoryKeywords = {
      injured_animal: [
        'injured', 'hurt', 'bleeding', 'wounded', 'sick', 'dying', 'dead', 'trapped', 
        'stuck', 'limping', 'broken', 'wing', 'leg', 'emergency', 'urgent', 'help',
        'rescue', 'pain', 'suffering', 'accident', 'hit', 'car', 'vehicle'
      ],
      human_wildlife_conflict: [
        'attack', 'aggressive', 'threatening', 'dangerous', 'bite', 'scratch', 
        'chase', 'property', 'damage', 'crop', 'garden', 'livestock', 'chicken',
        'conflict', 'problem', 'nuisance', 'pest', 'destroy', 'raid', 'invade'
      ],
      abandoned_pet: [
        'abandoned', 'stray', 'lost', 'pet', 'domestic', 'collar', 'tag', 'owner',
        'homeless', 'wandering', 'alone', 'puppy', 'kitten', 'cat', 'dog', 'tame'
      ],
      animal_sighting: [
        'saw', 'spotted', 'sighting', 'observe', 'watch', 'beautiful', 'rare',
        'unusual', 'first', 'time', 'amazing', 'wildlife', 'nature', 'photo'
      ]
    };

    // Species keywords
    this.speciesKeywords = {
      mammals: ['elephant', 'tiger', 'leopard', 'bear', 'deer', 'monkey', 'dog', 'cat', 'cow', 'buffalo'],
      birds: ['eagle', 'hawk', 'owl', 'crow', 'peacock', 'parrot', 'sparrow', 'pigeon', 'vulture'],
      reptiles: ['snake', 'lizard', 'crocodile', 'turtle', 'gecko', 'monitor'],
      insects: ['bee', 'wasp', 'butterfly', 'moth', 'ant', 'spider']
    };

    // Urgency indicators
    this.urgencyKeywords = {
      critical: ['emergency', 'urgent', 'dying', 'dead', 'bleeding', 'attack', 'immediate'],
      high: ['injured', 'hurt', 'sick', 'trapped', 'aggressive', 'dangerous'],
      medium: ['lost', 'stray', 'abandoned', 'unusual', 'problem'],
      low: ['sighting', 'spotted', 'saw', 'beautiful', 'photo']
    };
  }

  classifyMessage(message) {
    const tokens = this.tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    const classification = {
      category: this.classifyCategory(tokens, stemmedTokens),
      species: this.extractSpecies(tokens),
      urgency: this.determineUrgency(tokens),
      confidence: 0,
      needsManualReview: false
    };

    // Calculate confidence score
    classification.confidence = this.calculateConfidence(tokens, classification);
    
    // Flag for manual review if confidence is low
    classification.needsManualReview = classification.confidence < 0.8;

    logger.info('AI Classification completed', {
      message: message.substring(0, 100),
      classification
    });

    return classification;
  }

  classifyCategory(tokens, stemmedTokens) {
    const scores = {};
    
    // Initialize scores
    Object.keys(this.categoryKeywords).forEach(category => {
      scores[category] = 0;
    });

    // Score each category based on keyword matches
    tokens.forEach(token => {
      Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
        if (keywords.includes(token)) {
          scores[category] += 1;
        }
      });
    });

    // Also check stemmed tokens
    stemmedTokens.forEach(token => {
      Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
        const stemmedKeywords = keywords.map(kw => this.stemmer.stem(kw));
        if (stemmedKeywords.includes(token)) {
          scores[category] += 0.8; // Slightly lower weight for stemmed matches
        }
      });
    });

    // Find category with highest score
    const bestCategory = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    return bestCategory[1] > 0 ? bestCategory[0] : 'other';
  }

  extractSpecies(tokens) {
    const foundSpecies = [];
    
    Object.entries(this.speciesKeywords).forEach(([type, species]) => {
      species.forEach(animal => {
        if (tokens.includes(animal)) {
          foundSpecies.push(animal);
        }
      });
    });

    return foundSpecies;
  }

  determineUrgency(tokens) {
    const urgencyScores = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    tokens.forEach(token => {
      Object.entries(this.urgencyKeywords).forEach(([level, keywords]) => {
        if (keywords.includes(token)) {
          urgencyScores[level] += 1;
        }
      });
    });

    // Return highest scoring urgency level
    const bestUrgency = Object.entries(urgencyScores).reduce((a, b) => 
      urgencyScores[a[0]] > urgencyScores[b[0]] ? a : b
    );

    return bestUrgency[1] > 0 ? bestUrgency[0] : 'medium';
  }

  calculateConfidence(tokens, classification) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on keyword matches
    const categoryKeywords = this.categoryKeywords[classification.category] || [];
    const matchedKeywords = tokens.filter(token => categoryKeywords.includes(token));
    confidence += (matchedKeywords.length / tokens.length) * 0.4;

    // Increase confidence if species detected
    if (classification.species.length > 0) {
      confidence += 0.2;
    }

    // Increase confidence for clear urgency indicators
    const urgencyKeywords = this.urgencyKeywords[classification.urgency] || [];
    const urgencyMatches = tokens.filter(token => urgencyKeywords.includes(token));
    if (urgencyMatches.length > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  assignPriority(category, urgency, aiClassification) {
    // High priority categories always get elevated priority
    if (category === 'injured_animal' || category === 'human_wildlife_conflict') {
      return urgency === 'critical' ? 'critical' : 'high';
    }

    // Map urgency to priority
    const priorityMap = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };

    return priorityMap[urgency] || 'medium';
  }
}

module.exports = new AIClassificationService();