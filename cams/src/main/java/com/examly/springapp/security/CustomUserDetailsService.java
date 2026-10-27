package com.examly.springapp.security;

import com.examly.springapp.entity.User;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String cleanEmail = email != null ? email.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        String roleName = user.getRole().name();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));

        // Add aliases so both legacy and canonical role annotations match
        if (roleName.equals("PROGRAMME_COORDINATOR") || roleName.equals("COORDINATOR")) {
            authorities.add(new SimpleGrantedAuthority("ROLE_PROGRAMME_COORDINATOR"));
            authorities.add(new SimpleGrantedAuthority("ROLE_COORDINATOR"));
        } else if (roleName.equals("FINANCE_OFFICER") || roleName.equals("FINANCE")) {
            authorities.add(new SimpleGrantedAuthority("ROLE_FINANCE_OFFICER"));
            authorities.add(new SimpleGrantedAuthority("ROLE_FINANCE"));
        } else if (roleName.equals("ADMINISTRATOR") || roleName.equals("ADMIN")) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMINISTRATOR"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getIsActive()),
                true,
                true,
                true,
                authorities
        );
    }
}
