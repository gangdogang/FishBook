package com.fishnote.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserOAuthAccountRepository extends JpaRepository<UserOAuthAccount, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<UserOAuthAccount> findByProviderAndProviderUserId(
            OAuthProvider provider,
            String providerUserId);

    boolean existsByProviderAndUserId(OAuthProvider provider, Long userId);

    void deleteAllByUserId(Long userId);
}
