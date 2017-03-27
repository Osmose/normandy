import pytest
from rest_framework import serializers

from normandy.base.tests import Whatever
from normandy.recipes.tests import (
    ARGUMENTS_SCHEMA,
    ActionFactory,
    ChannelFactory,
    CountryFactory,
    LocaleFactory,
    RecipeFactory,
)
from normandy.recipes.api.serializers import (
    ActionSerializer, RecipeSerializer, SignedRecipeSerializer)


@pytest.mark.django_db()
class TestRecipeSerializer:
    def test_it_works(self, rf):
        channel = ChannelFactory()
        country = CountryFactory()
        locale = LocaleFactory()
        recipe = RecipeFactory(arguments={'foo': 'bar'}, channels=[channel], countries=[country],
                               locales=[locale])
        action = recipe.action
        serializer = RecipeSerializer(recipe, context={'request': rf.get('/')})

        assert serializer.data == {
            'name': recipe.name,
            'id': recipe.id,
            'last_updated': Whatever(),
            'enabled': recipe.enabled,
            'extra_filter_expression': recipe.extra_filter_expression,
            'filter_expression': Whatever(),
            'revision_id': recipe.revision_id,
            'action': action.name,
            'arguments': {
                'foo': 'bar',
            },
            'channels': [channel.slug],
            'countries': [country.code],
            'locales': [locale.code]
        }

    # If the action specified cannot be found, raise validation
    # error indicating the arguments schema could not be loaded
    def test_validation_with_wrong_action(self):
        serializer = RecipeSerializer(data={
            'action': 'action-that-doesnt-exist', 'arguments': {}
        })

        with pytest.raises(serializers.ValidationError):
            serializer.is_valid(raise_exception=True)

        assert serializer.errors['arguments'] == ['Could not find arguments schema.']

    # If the action can be found, raise validation error
    # with the arguments error formatted appropriately
    def test_validation_with_wrong_arguments(self):
        ActionFactory(
            name='show-heartbeat',
            arguments_schema=ARGUMENTS_SCHEMA
        )

        serializer = RecipeSerializer(data={
            'action': 'show-heartbeat',
            'arguments': {
                'surveyId': '',
                'surveys': [
                    {'title': '', 'weight': 1},
                    {'title': 'bar', 'weight': 1},
                    {'title': 'foo', 'weight': 0},
                    {'title': 'baz', 'weight': 'lorem ipsum'}
                ]
            }
        })

        with pytest.raises(serializers.ValidationError):
            serializer.is_valid(raise_exception=True)

        assert serializer.errors['arguments'] == {
            'surveyId': 'This field may not be blank.',
            'surveys': {
                0: {'title': 'This field may not be blank.'},
                2: {'weight': '0 is less than the minimum of 1'},
                3: {'weight': '\'lorem ipsum\' is not of type \'integer\''}
            }
        }

    def test_validation_with_valid_data(self):
        mockAction = ActionFactory(
            name='show-heartbeat',
            arguments_schema=ARGUMENTS_SCHEMA
        )

        channel = ChannelFactory(slug='release')
        country = CountryFactory(code='CA')
        locale = LocaleFactory(code='en-US')

        serializer = RecipeSerializer(data={
            'name': 'bar', 'enabled': True, 'extra_filter_expression': '[]',
            'action': 'show-heartbeat',
            'channels': ['release'],
            'countries': ['CA'],
            'locales': ['en-US'],
            'arguments': {
                'surveyId': 'lorem-ipsum-dolor',
                'surveys': [
                    {'title': 'adipscing', 'weight': 1},
                    {'title': 'consequetar', 'weight': 1}
                ]
            }
        })

        assert serializer.is_valid()
        assert serializer.validated_data == {
            'name': 'bar',
            'enabled': True,
            'extra_filter_expression': '[]',
            'action': mockAction,
            'arguments': {
                'surveyId': 'lorem-ipsum-dolor',
                'surveys': [
                    {'title': 'adipscing', 'weight': 1},
                    {'title': 'consequetar', 'weight': 1}
                ]
            },
            'channels': [channel],
            'countries': [country],
            'locales': [locale],
        }
        assert serializer.errors == {}

        def test_generate_filter_expression(self):
            channel1 = ChannelFactory(slug='beta', name='Beta')
            channel2 = ChannelFactory(slug='release', name='Release')
            country1 = CountryFactory(code='US', name='USA')
            country2 = CountryFactory(code='CA', name='Canada')
            locale1 = LocaleFactory(code='en-US', name='English (US)')
            locale2 = LocaleFactory(code='fr-CA', name='French (CA)')

            serializer = RecipeSerializer()
            r = RecipeFactory()
            expression = serializer.generate_filter_expression(r)
            assert expression == ''

            r = RecipeFactory(channels=[channel1])
            expression = serializer.generate_filter_expression(r)
            assert expression == "normandy.channel in ['beta']"

            r.update(channels=[channel1, channel2])
            expression = serializer.generate_filter_expression(r)
            assert expression == "normandy.channel in ['beta', 'release']"

            r = RecipeFactory(countries=[country1])
            expression = serializer.generate_filter_expression(r)
            assert expression == "normandy.country in ['US']"

            r.update(countries=[country1, country2])
            expression = serializer.generate_filter_expression(r)
            assert expression == "normandy.country in ['CA', 'US']"

            r = RecipeFactory(locales=[locale1])
            expression = serializer.generate_filter_expression(r)
            assert expression == "normandy.locale in ['en-US']"

            r.update(locales=[locale1, locale2])
            expression = serializer.generate_filter_expression(r)
            assert expression == "normandy.locale in ['en-US', 'fr-CA']"

            r = RecipeFactory(extra_filter_expression='2 + 2 == 4')
            expression = serializer.generate_filter_expression(r)
            assert expression == '2 + 2 == 4'

            r.update(channels=[channel1], countries=[country1], locales=[locale1])
            expression = serializer.generate_filter_expression(r)
            assert expression == (
                "(normandy.locale in ['en-US']) && (normandy.country in ['US']) && "
                "(normandy.channel in ['beta']) && (2 + 2 == 4)"
            )


@pytest.mark.django_db()
class TestActionSerializer:
    def test_it_uses_cdn_url(self, rf, settings):
        settings.CDN_URL = 'https://example.com/cdn/'
        action = ActionFactory()
        serializer = ActionSerializer(action, context={'request': rf.get('/')})
        assert serializer.data['implementation_url'].startswith(settings.CDN_URL)


@pytest.mark.django_db()
class TestSignedRecipeSerializer:
    def test_it_works_with_signature(self, rf):
        recipe = RecipeFactory(signed=True)
        context = {'request': rf.get('/')}
        combined_serializer = SignedRecipeSerializer(instance=recipe, context=context)
        recipe_serializer = RecipeSerializer(instance=recipe, context=context)

        # Testing for shape of data, not contents
        assert combined_serializer.data == {
            'signature': {
                'signature': Whatever(),
                'timestamp': Whatever(),
                'x5u': Whatever(),
                'public_key': Whatever(),
            },
            'recipe': recipe_serializer.data,
        }

    def test_it_works_with_no_signature(self, rf):
        recipe = RecipeFactory(signed=False)
        action = recipe.action
        serializer = SignedRecipeSerializer(instance=recipe, context={'request': rf.get('/')})

        assert serializer.data == {
            'signature': None,
            'recipe': {
                'name': recipe.name,
                'id': recipe.id,
                'enabled': recipe.enabled,
                'extra_filter_expression': recipe.extra_filter_expression,
                'filter_expression': Whatever(),
                'revision_id': recipe.revision_id,
                'action': action.name,
                'arguments': recipe.arguments,
                'last_updated': Whatever(),
                'channels': [],
                'countries': [],
                'locales': [],
            }
        }
