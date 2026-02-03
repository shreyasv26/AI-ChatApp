package com.chatapp.repository;

import com.chatapp.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends MongoRepository<Message, String> {

    Page<Message> findByRoomId(
            String roomId,
            Pageable pageable
    );
    Optional<Message> findFirstByRoomIdAndSenderNotOrderByTimestampDesc(String roomId, String sender);

    List<Message> findTop20ByRoomIdOrderByTimestampDesc(String roomId);

    List<Message> findTop100ByRoomIdOrderByTimestampDesc(String roomId);

    void deleteByRoomId(String roomId);
}

