package com.gerador_orcamentos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:orcamentos-test",
		"spring.datasource.username=sa",
		"spring.datasource.password="
})
class GeradorOrcamentosApplicationTests {

	@Test
	void contextLoads() {
	}
}
