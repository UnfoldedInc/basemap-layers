import {terser} from 'rollup-plugin-terser';

const config = (file, plugins = []) => ({
    input: 'lib/index.js',
    output: {
        name: 'deckgl-style-spec',
        format: 'umd',
        indent: false,
        file
    },
    plugins
});

export default [
    config('dist/deckgl-style-spec.js'),
    config('dist/deckgl-style-spec.min.js', [terser()])
];
