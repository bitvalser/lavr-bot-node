"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestsResultsController = void 0;
const Discord = __importStar(require("discord.js"));
const controller_base_class_1 = require("../classes/controller-base.class");
const controller_decorator_1 = require("../decorators/controller.decorator");
const test_service_1 = require("../services/test.service");
const firebase_1 = __importDefault(require("firebase"));
const RATING_MEDALS = ['🥇', '🥈', '🥉'];
let TestsResultsController = class TestsResultsController extends controller_base_class_1.ControllerBase {
    constructor() {
        super(...arguments);
        this.testsService = test_service_1.TestsService.getInstance();
    }
    static handleRefreshRating(message, testId) {
        firebase_1.default
            .firestore()
            .collection('tests')
            .doc(testId)
            .get()
            .then((result) => result.data())
            .then((test) => {
            firebase_1.default
                .firestore()
                .collection('tests')
                .doc(testId)
                .collection('results')
                .orderBy('points', 'desc')
                .limit(10)
                .onSnapshot((snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                message.suppressEmbeds(false).then(() => message.edit({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setTitle(`Рейтинг теста "${test.title}" (Топ 10)`)
                            .setDescription(test.description)
                            .setFields(data.map((user, i) => ({
                            inline: false,
                            name: `${i + 1} место ${RATING_MEDALS[i] || ''}`,
                            value: `**${user.name}** ${user.points} очков ${user.attempts ? `(${user.attempts} попыток)` : ''}`,
                        }))),
                    ],
                }));
            });
        });
    }
    processCommand() {
        var _a;
        const commandName = this.args[0];
        switch (commandName) {
            case 'список':
                this.message.channel.sendTyping();
                this.testsService.getTests().then((tests) => {
                    const rich = new Discord.MessageEmbed()
                        .setTitle('Список доступных тестов')
                        .setDescription(tests.map(({ title }) => `- ${title}`).join('\n'));
                    this.message.reply({
                        embeds: [rich],
                    });
                });
                break;
            case 'рейтинг':
                const testName = (_a = this.args) === null || _a === void 0 ? void 0 : _a[1];
                if (!testName) {
                    this.message.reply('Введите название теста.');
                    return;
                }
                this.message.channel.sendTyping();
                this.testsService.getTestByName(testName).then((data) => {
                    if (data) {
                        this.testsService.getTestRating(data.id).then((users) => {
                            const yourPosition = users.findIndex((item) => item.id === this.message.author.id);
                            this.message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setTitle(`Рейтинг теста "${data.title}" (Топ 25)`)
                                        .setDescription(data.description)
                                        .setFields(users.slice(0, 25).map((user, i) => ({
                                        inline: false,
                                        name: `${i + 1} место ${RATING_MEDALS[i] || ''}`,
                                        value: `**${user.name}** ${user.points} очков ${user.attempts ? `(${user.attempts} попыток)` : ''}`,
                                    }))),
                                    ...(yourPosition >= 0
                                        ? [
                                            new Discord.MessageEmbed()
                                                .setAuthor(this.message.author.username, this.message.author.avatarURL())
                                                .setTitle(`Вы на ${yourPosition + 1} месте ${RATING_MEDALS[yourPosition] || ''}`)
                                                .setFields([
                                                {
                                                    name: 'Ваши очки',
                                                    value: String(users[yourPosition].points),
                                                },
                                            ]),
                                        ]
                                        : []),
                                ],
                            });
                        });
                    }
                    else {
                        this.message.reply('Такого теста не существует!');
                    }
                });
                break;
            default:
                this.message.reply('Неизвестная команда!');
        }
    }
};
TestsResultsController = __decorate([
    (0, controller_decorator_1.Controller)({
        commands: ['тесты'],
    })
], TestsResultsController);
exports.TestsResultsController = TestsResultsController;
