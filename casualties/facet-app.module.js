/*
 * facetApp module definition
 */
(function() {

    'use strict';

    angular.module('facetApp', [
        'ui.router',
        'seco.facetedSearch',
        'seco.translateableObjectMapper',
        'ngTable',
        'pascalprecht.translate'
    ])

    .constant('_', _) // eslint-disable-line no-undef
    .constant('RESULTS_PER_PAGE', 25)
    .constant('PAGES_PER_QUERY', 1)
    .constant('defaultLocale', 'fi')
    .constant('supportedLocales', ['fi', 'en'])

    // The SPARQL endpoint URL
    .constant('ENDPOINT_URL', 'http://ldf.fi/warsa/sparql')

    .constant('PREFIXES',
        ' PREFIX skos: <http://www.w3.org/2004/02/skos/core#>' +
        ' PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>' +
        ' PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
        ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
        ' PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>' +
        ' PREFIX owl:  <http://www.w3.org/2002/07/owl#>' +
        ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>' +
        ' PREFIX georss: <http://www.georss.org/georss/>' +
        ' PREFIX text: <http://jena.apache.org/text#>' +
        ' PREFIX m: <http://ldf.fi/sotasampo/narc/menehtyneet/>' +
        ' PREFIX m_schema: <http://ldf.fi/schema/narc-menehtyneet1939-45/>'
    )

    .config(function($urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.strictMode(false);
    })

    .config(function($stateProvider) {
        $stateProvider
        .state('facetApp', {
            url: '/{lang}',
            templateUrl: 'views/main.html',
            resolve: {
                checkLang: checkLang
            }
        })
        .state('facetApp.casualties', {
            url: '/casualties',
            templateUrl: 'views/casualties.html',
            controller: 'MainController',
            controllerAs: 'vm'
        })
        .state('facetApp.casualtiesVisu', {
            url: '/casualties/vis',
            templateUrl: 'views/casualties.visu.html',
            controller: 'VisuController',
            controllerAs: 'vm'
        });
    })

    .config(function($urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.strictMode(false);
    })

    .config(function($locationProvider) {
        $locationProvider.html5Mode(true);
    })

    .config(function($translateProvider, defaultLocale) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'casualties/lang/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage(defaultLocale);
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    })

    .run(function($state, $transitions, $location) {
        $transitions.onError({}, function(transition) {
            // Temporary workaround for transition.error() not returning
            // the error (https://github.com/angular-ui/ui-router/issues/2866)
            return transition.promise.catch(function($error$) {
                if ($error$ && $error$.redirectTo) {
                    // Redirect to the given URL (the previous URL was missing
                    // the language code.
                    $location.url($error$.redirectTo);
                }
            });
        });
    });

    /* @ngInject */
    function checkLang($location, $stateParams, $q, $translate, _, supportedLocales, defaultLocale) {
        var lang = $stateParams.lang;
        if (lang && _.includes(supportedLocales, lang)) {
            return $translate.use(lang);
        }
        if (lang === 'casualties') {
            // No language code in URL, reject the transition with a fixed URL.
            var url = '/' + defaultLocale + $location.url();
            return $q.reject({ redirectTo: url });
        }

        return $q.reject();
    }
})();
