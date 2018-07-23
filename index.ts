/// <reference path="declarations.d.ts" />
import * as minify from 'minify-html-literals';
import { createFilter } from 'rollup-pluginutils';

/**
 * Plugin options.
 */
export interface Options {
  /**
   * Pattern or array of patterns of files to minify.
   */
  include?: string | string[];
  /**
   * Pattern or array of patterns of files not to minify.
   */
  exclude?: string | string[];
  /**
   * Minify options, see
   * https://www.npmjs.com/package/minify-html-literals#options.
   */
  options?: Partial<minify.Options>;
  /**
   * If true, any errors while parsing or minifying will abort the bundle
   * process. Defaults to false, which will only show a warning.
   */
  failOnError?: boolean;
  /**
   * Override minify-html-literals function.
   */
  minifyHTMLLiterals?: typeof minify.minifyHTMLLiterals;
  /**
   * Override include/exclude filter.
   */
  filter?: (id: string) => boolean;
}

export default function(options: Options = {}) {
  if (!options.minifyHTMLLiterals) {
    options.minifyHTMLLiterals = minify.minifyHTMLLiterals;
  }

  if (!options.filter) {
    options.filter = createFilter(options.include, options.exclude);
  }

  const minifyOptions = options.options || {};
  return {
    name: 'minify-html-literals',
    transform(this: any, code: string, id: string) {
      if (options.filter!(id)) {
        try {
          return options.minifyHTMLLiterals!(code, {
            ...minifyOptions,
            fileName: id
          });
        } catch (error) {
          if (options.failOnError) {
            this.error(error.message);
          } else {
            this.warn(error.message);
          }
        }
      }
    }
  };
}
