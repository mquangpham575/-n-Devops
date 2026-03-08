package com.blog.userservice.service;

import com.blog.userservice.dto.ConversationResponse;
import com.blog.userservice.dto.MessageRequest;
import com.blog.userservice.dto.MessageResponse;
import com.blog.userservice.model.Message;
import com.blog.userservice.model.User;
import com.blog.userservice.repository.FollowRepository;
import com.blog.userservice.repository.MessageRepository;
import com.blog.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final NotificationService notificationService;

    @Transactional
    public MessageResponse sendMessage(UUID senderId, UUID receiverId, MessageRequest request) {
        // Check if both users exist
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        // Create message (no mutual follow requirement)
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(request.getContent())
                .isRead(false)
                .build();
        
        message = messageRepository.save(message);

        // Send notification
        notificationService.createNewMessageNotification(receiverId, senderId, sender.getUsername());

        return toResponse(message, sender, receiver);
    }

    public List<MessageResponse> getMessagesBetweenUsers(UUID user1, UUID user2) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(user1, user2);
        return messages.stream()
                .map(message -> {
                    User sender = userRepository.findById(message.getSenderId()).orElse(null);
                    User receiver = userRepository.findById(message.getReceiverId()).orElse(null);
                    if (sender == null || receiver == null) return null;
                    return toResponse(message, sender, receiver);
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    public List<ConversationResponse> getConversations(UUID userId) {
        List<UUID> partnerIds = messageRepository.findConversationPartners(userId);
        
        List<ConversationResponse> conversations = new ArrayList<>();
        for (UUID partnerId : partnerIds) {
            User partner = userRepository.findById(partnerId).orElse(null);
            if (partner == null) continue;

            // Check mutual follow status (for UI indicator only)
            boolean isMutual = followRepository.areMutualFollowers(userId, partnerId);
            // Show all conversations regardless of mutual status

            Message lastMessage = messageRepository.findLastMessageBetweenUsers(userId, partnerId);
            long unreadCount = messageRepository.countByReceiverIdAndIsReadFalse(userId);

            ConversationResponse conversation = ConversationResponse.builder()
                    .userId(partner.getId())
                    .username(partner.getUsername())
                    .email(partner.getEmail())
                    .lastMessage(lastMessage != null ? lastMessage.getContent() : "")
                    .lastMessageTime(lastMessage != null ? lastMessage.getCreatedAt() : null)
                    .unreadCount(unreadCount)
                    .isMutualFollow(isMutual)
                    .build();
            
            conversations.add(conversation);
        }

        return conversations;
    }

    @Transactional
    public void markAsRead(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        
        // Only receiver can mark as read
        if (!message.getReceiverId().equals(userId)) {
            throw new IllegalArgumentException("Can only mark your own messages as read");
        }

        messageRepository.markAsRead(messageId);
    }

    @Transactional
    public void markAllAsReadFromSender(UUID receiverId, UUID senderId) {
        messageRepository.markAllAsReadFromSender(receiverId, senderId);
    }

    public long getUnreadCount(UUID userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    private MessageResponse toResponse(Message message, User sender, User receiver) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(sender.getId())
                .senderUsername(sender.getUsername())
                .receiverId(receiver.getId())
                .receiverUsername(receiver.getUsername())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
