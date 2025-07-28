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
exports.CreateGeneralReminderDto = exports.TestNotificationDto = exports.SendBulkNotificationDto = exports.UpdateNotificationDto = exports.CreateNotificationDto = exports.NotificationStatus = exports.NotificationChannel = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["WHATSAPP"] = "WHATSAPP";
    NotificationChannel["BOTH"] = "BOTH";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["DELIVERED"] = "DELIVERED";
    NotificationStatus["FAILED"] = "FAILED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
class CreateNotificationDto {
    userId;
    userSubscriptionId;
    channel;
    message;
    subject;
    templateVariables;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID for the notification' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User subscription ID (optional for general reminders)', required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userSubscriptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channel', enum: NotificationChannel }),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject for email notifications', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template variables', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "templateVariables", void 0);
class UpdateNotificationDto extends (0, swagger_1.PartialType)(CreateNotificationDto) {
    status;
    providerResponse;
    errorMessage;
}
exports.UpdateNotificationDto = UpdateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification status', enum: NotificationStatus, required: false }),
    (0, class_validator_1.IsEnum)(NotificationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotificationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Provider response', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateNotificationDto.prototype, "providerResponse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if failed', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotificationDto.prototype, "errorMessage", void 0);
class SendBulkNotificationDto {
    userIds;
    userSubscriptionIds;
    channel;
    message;
    subject;
    templateVariables;
}
exports.SendBulkNotificationDto = SendBulkNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of user IDs' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], SendBulkNotificationDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of user subscription IDs (optional for general reminders)', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SendBulkNotificationDto.prototype, "userSubscriptionIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channel', enum: NotificationChannel }),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject for email notifications', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template variables', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendBulkNotificationDto.prototype, "templateVariables", void 0);
class TestNotificationDto {
    recipient;
    channel;
    message;
    subject;
}
exports.TestNotificationDto = TestNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Test recipient email or phone' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "recipient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channel', enum: NotificationChannel }),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Test message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject for email test', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestNotificationDto.prototype, "subject", void 0);
class CreateGeneralReminderDto {
    userId;
    channel;
    message;
    subject;
    templateVariables;
}
exports.CreateGeneralReminderDto = CreateGeneralReminderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID for the reminder' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGeneralReminderDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification channel', enum: NotificationChannel }),
    (0, class_validator_1.IsEnum)(NotificationChannel),
    __metadata("design:type", String)
], CreateGeneralReminderDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reminder message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGeneralReminderDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject for email reminders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGeneralReminderDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template variables for personalization', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateGeneralReminderDto.prototype, "templateVariables", void 0);
//# sourceMappingURL=notification.dto.js.map