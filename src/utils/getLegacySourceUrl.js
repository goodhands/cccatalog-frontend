import buildUrl from 'build-url'

/**
 * A mapping of each legacy source with its url builder functions for each content type.
 * Urls were based off of data found here: https://github.com/creativecommons/cccatalog-frontend/issues/315
 */
export const legacySourceMap = {
  Europeana: {
    audio(search) {
      let query = `${search.q} AND RIGHTS:*creative*` // search cc licensed works

      if (search.filters && search.filters.commercial) {
        if (search.filters.comercial) query = `${query} AND NOT RIGHTS:*nc*`
        if (search.filters.modify) query = `${query} AND NOT RIGHTS:*nd*`
      }

      return {
        url: 'https://www.europeana.eu/en/search',
        query: {
          page: 1,
          qf: 'TYPE:"SOUND"',
          query,
        },
      }
    },
    video(search) {
      let query = `${search.q} AND RIGHTS:*creative*` // search cc licensed works

      if (search.filters && search.filters.commercial) {
        if (search.filters.comercial) query = `${query} AND NOT RIGHTS:*nc*`
        if (search.filters.modify) query = `${query} AND NOT RIGHTS:*nd*`
      }

      return {
        url: 'https://www.europeana.eu/en/search',
        query: {
          page: 1,
          qf: 'TYPE:"VIDEO"',
          query,
        },
      }
    },
  },
  'Wikimedia Commons': {
    audio(search) {
      return {
        url: 'https://commons.wikimedia.org/w/index.php',
        query: {
          sort: 'relevance',
          search: `${search.q} filetype:audio`,
          title: 'Special:Search',
          'advancedSearch-current': '{"fields":{"filetype":"audio"}}',
        },
      }
    },
    video(search) {
      return {
        url: 'https://commons.wikimedia.org/w/index.php',
        query: {
          sort: 'relevance',
          search: `${search.q} filetype:video`,
          title: 'Special:Search',
          'advancedSearch-current': '{"fields":{"filetype":"audio"}}',
        },
      }
    },
  },
  Jamendo: {
    // https://www.jamendo.com/legal/creative-commons
    audio(search) {
      return {
        url: 'https://www.jamendo.com/search/tracks',
        query: {
          q: search.q,
        },
      }
    },
  },
  ccMixter: {
    audio(search) {
      return {
        // no https :(
        url: 'http://dig.ccmixter.org/search',
        query: {
          lic: 'open',
          searchp: search.q,
        },
      }
    },
  },
  SoundCloud: {
    audio(search) {
      let license = 'to_share'

      if (search.filters && search.filters.commercial) {
        if (search.filters.commercial) license = 'to_use_commercially'
        if (search.filters.modify) license = 'to_modify_commercially'
      }

      return {
        url: 'https://soundcloud.com/search/sounds',
        query: {
          q: search.q,
          'filter.license': license, // @todo: choose which type from the search object
        },
      }
    },
  },
  YouTube: {
    video(search) {
      return {
        url: 'https://www.youtube.com/results',
        query: {
          search_query: search.q,
          sp: 'EgIwAQ%3D%3D', // this interesting line filters by cc license
        },
      }
    },
  },
  'Google Images': {
    // 'sur:fc' // reuse
    // 'sur:fmc' // reuse with modification
    // 'sur:fm' // noncommercial reuse with modification
    // 'sur:f' // noncommercial reuse

    image(search) {
      let use = 'sur:f'

      if (search.filters && search.filters.commercial) {
        if (search.filters.commercial) {
          use = 'sur:fc'
        }
        if (search.filters.modify) {
          use = 'sur:fm'
        }
        if (search.filters.commercial && search.filters.modify) {
          use = 'sur:fmc'
        }
      }

      return {
        url: 'https://www.google.com/search',
        query: {
          tbm: 'isch', // this means 'search images'
          tbs: use,
          ved: '0ahUKEwjoqOr_2dLqAhXNlnIEHWoFDysQ4dUDCAY', // this *seems* to mean that an 'advanced' or 'filtered' search is occuring
          q: search.q,
        },
      }
    },
  },
  'Open Clip Art Library': {
    image(search) {
      return {
        url: 'http://www.openclipart.org/search/',
        query: {
          query: search.q,
        },
      }
    },
  },
}

/**
 * getLegacySourceUrl
 *
 * Return a valid url of search results for the provided meta search type (currently audio or video)
 * @param {'image'|'audio'|'video'} type The type of media our meta search is for
 *
 *  */
const getLegacySourceUrl = (type) => (sourceName, search) => {
  if (!search) {
    throw new Error(
      `Please provide a valid query to search ${sourceName} for ${type} files.`
    )
  }

  const source = legacySourceMap[sourceName]
  if (!source) {
    throw new Error(
      `No data avaliable for provided legacy source: ${sourceName}`
    )
  }

  const getSourceUrlInfo = source[type]
  if (!getSourceUrlInfo) {
    throw new Error(`${sourceName} does not offer meta search for ${type}`)
  }

  const urlInfo = getSourceUrlInfo(search)

  return buildUrl(urlInfo.url, { queryParams: urlInfo.query })
}

export default getLegacySourceUrl
