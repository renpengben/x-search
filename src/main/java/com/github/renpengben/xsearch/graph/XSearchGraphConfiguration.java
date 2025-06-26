package com.github.renpengben.xsearch.graph;

import static com.alibaba.cloud.ai.graph.StateGraph.END;
import static com.alibaba.cloud.ai.graph.StateGraph.START;
import static com.alibaba.cloud.ai.graph.action.AsyncNodeAction.node_async;

import com.alibaba.cloud.ai.graph.GraphRepresentation;
import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.OverAllStateFactory;
import com.alibaba.cloud.ai.graph.StateGraph;
import com.alibaba.cloud.ai.graph.exception.GraphStateException;
import com.alibaba.cloud.ai.graph.state.strategy.ReplaceStrategy;
import com.github.renpengben.xsearch.graph.nodes.MoreQuestionNode;
import com.github.renpengben.xsearch.graph.nodes.SolveQuestionNode;
import com.github.renpengben.xsearch.graph.nodes.SearchNode;
import com.github.renpengben.xsearch.search.SearchService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class XSearchGraphConfiguration {

  @Bean
  public StateGraph xSearchGraph(ChatModel chatModel, SearchService searchService)
      throws GraphStateException {
    ChatClient client = ChatClient.builder(chatModel).defaultAdvisors(new SimpleLoggerAdvisor())
        .build();
    OverAllStateFactory factory = () -> {
      OverAllState s = new OverAllState();
      s.registerKeyAndStrategy("query", new ReplaceStrategy());
      s.registerKeyAndStrategy("searchResponse", new ReplaceStrategy());
      s.registerKeyAndStrategy("moreQuestions", new ReplaceStrategy());
      s.registerKeyAndStrategy("result", new ReplaceStrategy());
      return s;
    };
    StateGraph graph = new StateGraph("XSearchGraph", factory.create())
        // 注册节点
        .addNode("searchNode", node_async(new SearchNode(searchService)))
        .addNode("llmNode", node_async(new SolveQuestionNode(client)))
        .addNode("moreQuestionNode", node_async(new MoreQuestionNode(client)))
        .addEdge(START, "searchNode")
        .addEdge("searchNode", "llmNode")
        .addEdge("searchNode", "moreQuestionNode")
        .addEdge("moreQuestionNode", END)
        .addEdge("llmNode", END);

    // 可视化
    GraphRepresentation representation = graph.getGraph(GraphRepresentation.Type.PLANTUML,
        "XSearchGraph");
    System.out.println("\n=== XSearchGraph  UML Flow ===");
    System.out.println(representation.content());
    System.out.println("==================================\n");

    return graph;
  }
}
