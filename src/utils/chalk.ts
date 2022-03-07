import chalk from 'chalk';

chalk.level = 3;
const error = chalk.bold.redBright;
const warning = chalk.hex('#FFA500'); // Orange color
export {chalk, error, warning};
