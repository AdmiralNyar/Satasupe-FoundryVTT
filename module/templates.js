/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [
    // Attribute list partial.
    "systems/satasupe/templates/parts/sheet-attributes.html",
    "systems/satasupe/templates/parts/actor-karma.html",
    "systems/satasupe/templates/parts/sheet-groups.html",
    "systems/satasupe/templates/parts/actor-other.html",
    "systems/satasupe/templates/parts/actor-history.html",
    "systems/satasupe/templates/parts/actor-chatpalette.html",
    "systems/satasupe/templates/parts/actor-equipment.html",
    "systems/satasupe/templates/parts/npc-history.html",
    "systems/satasupe/templates/parts/actor-buttons.html",
    'systems/satasupe/templates/apps/checkgene.html',
    'systems/satasupe/templates/apps/checkalign.html',
    'systems/satasupe/templates/apps/checkarm.html',
    'systems/satasupe/templates/apps/check.html',
    'systems/satasupe/templates/apps/clipload.html',
    'systems/satasupe/templates/apps/fvttbcdice.html',
    'systems/satasupe/templates/apps/importActor.html',
    'systems/satasupe/templates/apps/selectItem.html'
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};