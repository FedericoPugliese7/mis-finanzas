/**
 * Feature bundle for LazyMotion.
 *
 * This module exists as its own file on purpose: importing it dynamically
 * makes Vite/Rollup emit a separate async chunk, so Motion's animation engine
 * is not part of the initial bundle. Combined with the minimal components
 * from `motion/react-m`, Motion's initial cost stays tiny.
 */
import { domAnimation } from 'motion/react';

export default domAnimation;
