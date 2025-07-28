"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTemplateDto = exports.CreateTemplateDto = exports.PaymentProvider = exports.NotificationChannel = exports.RecurringInterval = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RecurringInterval;
(function (RecurringInterval) {
    RecurringInterval["MINUTES"] = "MINUTES";
    RecurringInterval["HOURS"] = "HOURS";
    RecurringInterval["DAYS"] = "DAYS";
    RecurringInterval["WEEKS"] = "WEEKS";
    RecurringInterval["MONTHS"] = "MONTHS";
})(RecurringInterval || (exports.RecurringInterval = RecurringInterval = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["WHATSAPP"] = "WHATSAPP";
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["BOTH"] = "BOTH";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["RAZORPAY"] = "RAZORPAY";
    PaymentProvider["STRIPE"] = "STRIPE";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
class CreateTemplateDto {
    title;
    body;
    amount;
    recurringValue;
    recurringInterval;
    notificationChannel;
    paymentProvider;
    isActive;
    enablePaymentReminders;
    includePaymentLink;
    reminderDaysBefore;
    enableOverdueReminders;
    overdueReminderDays;
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template body/message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTemplateDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recurring payment value' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTemplateDto.prototype, "recurringValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recurring payment interval', enum: RecurringInterval }),
    (0, class_validator_1.IsEnum)(RecurringInterval),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "recurringInterval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channel', enum: NotificationChannel }),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "notificationChannel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment provider', enum: PaymentProvider }),
    (0, class_validator_1.IsEnum)(PaymentProvider),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "paymentProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether template is active', required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable payment reminders', required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "enablePaymentReminders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Include payment links in reminders', required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "includePaymentLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days before due date to send reminders', required: false, default: [7, 3, 1] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "reminderDaysBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable overdue payment reminders', required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "enableOverdueReminders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days after due date to send overdue reminders', required: false, default: [1, 3, 7] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "overdueReminderDays", void 0);
class UpdateTemplateDto {
    title;
    body;
    amount;
    recurringValue;
    recurringInterval;
    notificationChannel;
    paymentProvider;
    isActive;
}
exports.UpdateTemplateDto = UpdateTemplateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTemplateDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateTemplateDto.prototype, "recurringValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RecurringInterval),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "recurringInterval", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "notificationChannel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentProvider),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "paymentProvider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTemplateDto.prototype, "isActive", void 0);
//# sourceMappingURL=template.dto.js.map