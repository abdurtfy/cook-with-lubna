CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerName` varchar(255) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`razorpayPaymentId` varchar(100) NOT NULL,
	`razorpayOrderId` varchar(100) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'INR',
	`paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`downloadToken` varchar(64) NOT NULL,
	`downloadedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_razorpayPaymentId_unique` UNIQUE(`razorpayPaymentId`),
	CONSTRAINT `orders_downloadToken_unique` UNIQUE(`downloadToken`)
);
