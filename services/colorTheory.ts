import { getColorById } from '../constants/colors';
import { Colors } from '../constants/theme';
import { BetterAlternative, MatchResult, MatchSelection } from '../types';

export function evaluateColorMatch(selection: MatchSelection): MatchResult {
  const top = getColorById(selection.topColor);
  const bottom = getColorById(selection.bottomColor);
  const shoes = getColorById(selection.shoesColor);
  const accessory = selection.accessoryColor ? getColorById(selection.accessoryColor) : undefined;
  const { occasion, style } = selection;

  let baseScore = 70;
  let harmonyType = 'Balanced Contemporary';
  let topBottomSynergyText = '';
  let shoeSynergyText = '';
  let accessoryText = '';
  let occasionComment = '';
  let occasionFit: 'Perfect' | 'Suitable' | 'Fair' | 'Not Recommended' = 'Suitable';

  // --- 1. TOP & BOTTOM SYNERGY ---
  const isTopNeutral = top.family === 'neutral' || top.id === 'cream' || top.id === 'beige';
  const isBottomNeutral = bottom.family === 'neutral' || bottom.id === 'cream' || bottom.id === 'beige';
  const isTopEarth = top.family === 'earth';
  const isBottomEarth = bottom.family === 'earth';

  // Both same hue (monochromatic)
  if (top.id === bottom.id) {
    if (top.id === 'black') {
      baseScore += 18;
      harmonyType = 'All-Black Minimalist';
      topBottomSynergyText = 'Monochromatic black silhouette delivers sleek, razor-sharp sophistication with modern runway presence.';
    } else if (top.id === 'white' || top.id === 'cream') {
      baseScore += 16;
      harmonyType = 'Monochromatic Riviera Cream';
      topBottomSynergyText = 'Tonal ivory & white flow creates an airy, resort-inspired quiet luxury aesthetic.';
    } else if (top.family === 'earth') {
      baseScore += 14;
      harmonyType = 'Tonal Earth Palette';
      topBottomSynergyText = 'Subtle earthy monochromatic layers feel grounded, relaxed, and effortlessly intentional.';
    } else {
      baseScore += 4;
      harmonyType = 'Monochromatic Accent';
      topBottomSynergyText = `Single-color pairing of ${top.name} makes a bold visual statement. Consider breaking it up with contrasting textures or layer.`;
    }
  }
  // Neutral Base + Accent Color
  else if (isTopNeutral && !isBottomNeutral) {
    baseScore += 16;
    harmonyType = 'Anchor Contrast Harmony';
    topBottomSynergyText = `${top.name} acts as a pristine canvas, allowing the ${bottom.name} trousers to command tasteful visual emphasis without overpowering.`;
  } else if (!isTopNeutral && isBottomNeutral) {
    baseScore += 17;
    harmonyType = 'Hero Top Focus';
    topBottomSynergyText = `Grounding your ${top.name} top with neutral ${bottom.name} pants creates an impeccable focal hierarchy and balanced proportions.`;
  }
  // Neutral + Neutral
  else if (isTopNeutral && isBottomNeutral) {
    baseScore += 18;
    harmonyType = 'Timeless Neutral Elegance';
    topBottomSynergyText = `${top.name} and ${bottom.name} deliver an understated, high-society neutral balance revered in tailored contemporary menswear and womenswear.`;
  }
  // Earth Tones Together (Olive, Brown, Beige, Cream)
  else if (isTopEarth && isBottomEarth) {
    baseScore += 17;
    harmonyType = 'Natural Earth Synergy';
    topBottomSynergyText = `${top.name} and ${bottom.name} tap into organic botanical tones, establishing an authentic, ruggedly refined sartorial bond.`;
  }
  // Complementary Pairs
  else if (
    (top.id === 'navy' && (bottom.id === 'brown' || bottom.id === 'beige' || bottom.id === 'orange')) ||
    (bottom.id === 'navy' && (top.id === 'brown' || top.id === 'beige' || top.id === 'orange')) ||
    (top.id === 'olive' && (bottom.id === 'maroon' || bottom.id === 'pink')) ||
    (bottom.id === 'olive' && (top.id === 'maroon' || top.id === 'pink')) ||
    (top.id === 'blue' && (bottom.id === 'brown' || bottom.id === 'cream')) ||
    (bottom.id === 'blue' && (top.id === 'brown' || top.id === 'cream'))
  ) {
    baseScore += 16;
    harmonyType = 'Classic Complementary Contrast';
    topBottomSynergyText = `${top.name} opposite ${bottom.name} strikes an artful complementary dialogue where warm and cool temperatures accentuate each other.`;
  }
  // Analogous / Adjacent Tones
  else if (
    (top.family === bottom.family && top.family !== 'neutral') ||
    (top.undertone === bottom.undertone && top.undertone !== 'neutral')
  ) {
    baseScore += 11;
    harmonyType = 'Harmonious Analogous Flow';
    topBottomSynergyText = `Sharing consistent ${top.undertone} undertones, ${top.name} and ${bottom.name} glide smoothly without disruptive visual friction.`;
  }
  // Clashing Saturated Brights
  else if (
    (top.id === 'orange' && bottom.id === 'pink') ||
    (top.id === 'pink' && bottom.id === 'orange') ||
    (top.id === 'red' && bottom.id === 'purple') ||
    (top.id === 'purple' && bottom.id === 'red') ||
    (top.id === 'yellow' && bottom.id === 'red') ||
    (top.id === 'green' && bottom.id === 'red')
  ) {
    baseScore -= 18;
    harmonyType = 'High-Saturate Friction';
    topBottomSynergyText = `${top.name} and ${bottom.name} fight for optical dominance, creating visual fatigue without a neutral buffer piece.`;
  } else {
    baseScore += 5;
    topBottomSynergyText = `${top.name} top alongside ${bottom.name} bottom provides an unconventional yet wearable dynamic.`;
  }

  // Value / Contrast dynamics
  if (top.brightness === 'light' && bottom.brightness === 'dark') {
    baseScore += 5; // classic, flattering silhouette
  } else if (top.brightness === 'dark' && bottom.brightness === 'light') {
    baseScore += 4; // modern inverted contrast
  }

  // --- 2. SHOE ANCHOR EVALUATION ---
  if (shoes.id === 'white') {
    if (style === 'Formal' || occasion === 'Wedding') {
      baseScore -= 8;
      shoeSynergyText = 'White sneakers create a stark casual departure that conflicts with formal dress codes. Consider dark leather oxfords.';
    } else {
      baseScore += 8;
      shoeSynergyText = 'Pristine white footwear provides an effortless, crisp anchor that brightens the silhouette.';
    }
  } else if (shoes.id === 'brown' || shoes.id === 'beige') {
    if (bottom.id === 'black' && style === 'Formal') {
      baseScore -= 5;
      shoeSynergyText = 'Brown leather with pitch-black formal trousers breaks classic sartorial conventions. Switch to black leather shoes for formal elegance.';
    } else if (bottom.id === 'navy' || bottom.id === 'olive' || bottom.id === 'beige' || bottom.id === 'cream' || bottom.id === 'blue') {
      baseScore += 10;
      shoeSynergyText = `${shoes.name} footwear complements ${bottom.name} seamlessly, providing rich heritage warmth and grounded elegance.`;
    } else {
      baseScore += 5;
      shoeSynergyText = `${shoes.name} shoes introduce warm organic framing to the lower hem.`;
    }
  } else if (shoes.id === 'black') {
    if (bottom.id === 'black' || bottom.id === 'grey' || bottom.id === 'navy' || bottom.id === 'white') {
      baseScore += 8;
      shoeSynergyText = 'Black shoes anchor the ensemble with undeniable authority and classic grounding.';
    } else {
      baseScore += 4;
      shoeSynergyText = 'Black shoes offer a dependable, weighted baseline.';
    }
  } else if (shoes.id === bottom.id || shoes.id === top.id) {
    baseScore += 6;
    shoeSynergyText = `${shoes.name} footwear echoes your ${shoes.id === bottom.id ? 'bottoms' : 'top'}, producing balanced color cadence from top to toe.`;
  } else if (shoes.family === 'warm' && (shoes.id === 'red' || shoes.id === 'orange' || shoes.id === 'yellow')) {
    baseScore -= 4;
    shoeSynergyText = `Vibrant ${shoes.name} footwear draws the eye abruptly downward. Ensure it matches an accessory or jacket to avoid detachment.`;
  } else {
    shoeSynergyText = `${shoes.name} shoes complete the lower stance cleanly.`;
  }

  // --- 3. ACCESSORY SYNERGY ---
  if (accessory) {
    if (accessory.id === shoes.id) {
      baseScore += 6;
      accessoryText = `Matching your ${accessory.name} accessories with your footwear is a masterclass in classic coordination (the belt-and-shoe harmony).`;
    } else if (accessory.id === top.id || accessory.id === bottom.id) {
      baseScore += 5;
      accessoryText = `${accessory.name} accent highlights existing tones in your ${accessory.id === top.id ? 'top' : 'trousers'} for cohesive polish.`;
    } else if (accessory.family === 'neutral' || accessory.id === 'brown') {
      baseScore += 5;
      accessoryText = `Understated ${accessory.name} accessory adds curated depth without cluttering the palette.`;
    } else {
      baseScore += 2;
      accessoryText = `${accessory.name} detail adds an intentional pop of personal style.`;
    }
  } else {
    accessoryText = `No accessory specified. Elevate this outfit with a minimalist timepiece, textured belt, or understated neckwear.`;
  }

  // --- 4. OCCASION & STYLE ADAPTATION ---
  switch (occasion) {
    case 'Office':
      if (['navy', 'black', 'grey', 'white', 'cream', 'beige', 'blue'].includes(top.id) &&
          ['navy', 'black', 'grey', 'beige', 'brown', 'cream'].includes(bottom.id)) {
        baseScore += 8;
        occasionFit = 'Perfect';
        occasionComment = `Superbly calibrated for corporate and formal environments—commanding, poised, and universally respected.`;
      } else if (['orange', 'yellow', 'pink', 'red'].includes(top.id) || ['orange', 'yellow', 'red'].includes(bottom.id)) {
        baseScore -= 10;
        occasionFit = 'Not Recommended';
        occasionComment = `High saturation colors carry excessive informality for traditional office or formal settings.`;
      } else {
        baseScore += 3;
        occasionFit = 'Suitable';
        occasionComment = `Appropriate for business-casual environments, especially if styled with tailored silhouettes.`;
      }
      break;

    case 'Wedding':
      if (['cream', 'white', 'beige', 'maroon', 'navy', 'purple', 'olive'].includes(top.id) || style === 'Traditional') {
        baseScore += 7;
        occasionFit = 'Perfect';
        occasionComment = `Rich and ceremonial. Possesses the regal dignity and celebration-ready opulence expected at weddings.`;
      } else {
        occasionFit = 'Suitable';
        occasionComment = `Celebratory and refined. Accessorize with metallic jewelry or a tailored waistcoat.`;
      }
      break;

    case 'Party':
      if (top.id === 'black' || bottom.id === 'black' || top.id === 'maroon' || top.id === 'navy' || top.id === 'red') {
        baseScore += 7;
        occasionFit = 'Perfect';
        occasionComment = `Chic, evening-ready aesthetic that catches artificial and ambient lighting with confidence.`;
      } else {
        occasionFit = 'Suitable';
        occasionComment = `Lively and fun for social night outs and cocktail gatherings.`;
      }
      break;

    case 'Date':
      if (['navy', 'white', 'black', 'cream', 'olive', 'maroon', 'pink'].includes(top.id)) {
        baseScore += 8;
        occasionFit = 'Perfect';
        occasionComment = `Inviting, attractive, and effortlessly confident without trying too hard.`;
      } else {
        occasionFit = 'Suitable';
        occasionComment = `Comfortable and expressive for romance and intimate evenings.`;
      }
      break;

    case 'Casual':
    case 'College':
    case 'Travel':
    default:
      baseScore += 6;
      occasionFit = 'Perfect';
      occasionComment = `Ideal everyday balance—relaxed yet clearly put together with conscious intent.`;
      break;
  }

  // Style bonus
  if (style === 'Minimal' && isTopNeutral && isBottomNeutral) {
    baseScore += 5;
  } else if (style === 'Streetwear' && (top.id === 'black' || top.id === 'white' || bottom.id === 'black')) {
    baseScore += 5;
  } else if (style === 'Smart Casual' && (top.id === 'navy' || top.id === 'white' || bottom.id === 'beige' || bottom.id === 'olive')) {
    baseScore += 5;
  }

  // Clamp score
  const finalScore = Math.min(99, Math.max(38, Math.round(baseScore)));

  // Rating & Label
  let rating: MatchResult['rating'] = 'GOOD';
  let ratingLabel = 'Balanced & Stylish';
  let ratingColor = Colors.scoreGood;

  if (finalScore >= 88) {
    rating = 'EXCELLENT';
    ratingLabel = 'Flawless Sartorial Harmony';
    ratingColor = Colors.scoreExcellent;
  } else if (finalScore >= 75) {
    rating = 'GOOD';
    ratingLabel = 'Stylish & Well-Balanced';
    ratingColor = Colors.scoreGood;
  } else if (finalScore >= 60) {
    rating = 'AVERAGE';
    ratingLabel = 'Wearable with Minor Adjustments';
    ratingColor = Colors.scoreAverage;
  } else {
    rating = 'POOR';
    ratingLabel = 'Color Conflict / Clashing';
    ratingColor = Colors.scorePoor;
  }

  // Explanation synthesizer
  const explanation = `${top.name} on ${bottom.name} grounded by ${shoes.name} footwear creates an ${ratingLabel.toLowerCase()} expression. ${topBottomSynergyText} ${shoeSynergyText}`;

  // Accessories recommendations
  const accessoryRecommendations: string[] = [];
  if (bottom.id === 'navy' || bottom.id === 'blue' || bottom.id === 'olive') {
    accessoryRecommendations.push('Cognac Italian leather belt with brushed brass buckle');
    accessoryRecommendations.push('Subtle tan leather strap chronograph watch');
  } else if (bottom.id === 'black' || bottom.id === 'grey') {
    accessoryRecommendations.push('Polished silver link bracelet or matte black minimalist timepiece');
    accessoryRecommendations.push('Full-grain black leather belt with nickel hardware');
  } else {
    accessoryRecommendations.push('Woven braided belt in neutral tan and beige cords');
    accessoryRecommendations.push('Tortoiseshell acetate sunglasses');
  }

  if (style === 'Formal' || occasion === 'Office') {
    accessoryRecommendations.push('Silk twill pocket square with subtle micro-houndstooth border');
  } else if (occasion === 'Wedding') {
    accessoryRecommendations.push('Antique gold-plated lapel pin or embroidered raw silk stole');
  } else {
    accessoryRecommendations.push('Structured minimalist canvas & leather tote or weekender bag');
  }

  // Better alternatives
  const betterAlternatives: BetterAlternative[] = [];

  // Alternative 1: Swap top or bottom to classic anchor
  if (!isBottomNeutral) {
    betterAlternatives.push({
      title: 'Neutral Baseline Upgrade',
      description: `Switch the pants to Beige or Navy to let your ${top.name} piece shine with refined dignity.`,
      topColor: top.id,
      bottomColor: top.id === 'beige' ? 'navy' : 'beige',
      shoesColor: shoes.id === 'black' && top.id !== 'black' ? 'brown' : 'white',
      accessoryColor: 'brown',
      expectedScore: 94,
    });
  } else {
    betterAlternatives.push({
      title: 'Rich Tonal Contrast',
      description: `Pair with an Olive or Navy top over your ${bottom.name} pants for European tailoring flair.`,
      topColor: bottom.id === 'navy' ? 'cream' : 'navy',
      bottomColor: bottom.id,
      shoesColor: bottom.id === 'navy' ? 'brown' : 'white',
      accessoryColor: 'brown',
      expectedScore: 96,
    });
  }

  // Alternative 2: Contemporary Monochromatic / Earthy
  betterAlternatives.push({
    title: 'Curated Monochromatic Minimalist',
    description: `Opt for a layered tonal spectrum with Cream, Beige, and warm Brown leather anchors.`,
    topColor: 'cream',
    bottomColor: 'beige',
    shoesColor: 'brown',
    accessoryColor: 'brown',
    expectedScore: 98,
  });

  return {
    score: finalScore,
    rating,
    ratingLabel,
    ratingColor,
    harmonyType,
    explanation,
    itemFeedback: {
      topAndBottom: topBottomSynergyText,
      shoeAnchor: shoeSynergyText,
      accessoryTouch: accessoryText,
    },
    occasionSuitability: {
      fit: occasionFit,
      comment: occasionComment,
    },
    accessoryRecommendations,
    betterAlternatives,
  };
}
